import React, { Component, Fragment } from 'react';
import './App.css';

function assembleRows(classSchedule) {
  const rows = [[],[],[],[],[],[],[]]
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      rows[j][i] = classSchedule[i][j] !== undefined ? classSchedule[i][j] : null
    }
  }
  console.log(rows)
  return rows
}

async function fakeAuth(email) {
  if (email.indexOf('@') === -1) {
    throw new Error('Invalid email')
  }
  return 'abcde'
}
class App extends Component {
  state = {
    email: '',
    password: '',
    token: undefined,
    error: undefined,
    schedules: undefined,
    classSchedule: undefined,
    moolah: undefined
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value})
  }

  handleSubmit = (event) => {
    this.setState({ error: undefined })
    fakeAuth(this.state.email)
      .then(token => this.setState({ token }))
      .catch(error => this.setState({ error: error.message }))

    // const chartiesUrl = `https://api.dineoncampus.com/v1/locations/open?site_id=5751fd3390975b60e048938a&timestamp=${new Date(Date.now()).toISOString()}`
    fetch('/charties')
      .then(res => res.json())
      .then(data => {
        console.log(data)
        const schedules = data['location_schedules']
        this.setState({schedules})
      })
      .catch(error => console.log(error))

    fetch('/schedule', {
      method: "POST",
      body: JSON.stringify({
        "Email": this.state.email.slice(0, this.state.email.indexOf('@')),
        "Password": this.state.password
      })
    })
      .then(res => res.json())
      .then(data => {
        console.log(data)
        this.setState({ classSchedule: data })
      })
      .catch(error => console.log(error))

    fetch('/moolah', {
      method: "POST",
      body: JSON.stringify({
        "Email": this.state.email.slice(0, this.state.email.indexOf('@')),
        "Password": this.state.password
      })
    })
      .then(res => res.json())
      .then(data => this.setState({ moolah: data }))

    event.preventDefault()
  }

  handleSignOut = () => {
    this.setState({ token: undefined, email: '' })
  }

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-10 offset-md-1">
            <h1>Final Project</h1>
            { this.state.token === undefined ? (
              <form onSubmit={this.handleSubmit} style={{ maxWidth: '300px'}}>
                <label className="sr-only" htmlFor="email">Email</label>
                <div className="form-group">
                  <input
                    required
                    id="email"
                    type="email"
                    placeholder="Email"
                    className="form-control"
                    name="email"
                    value={this.state.value}
                    onChange={this.handleChange} />
                  <input
                    required
                    id="password"
                    type="password"
                    placeholder="password"
                    className="form-control"
                    name="password"
                    value={this.state.value}
                    onChange={this.handleChange} />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                >Sign In</button>
              </form>
            ) : (
              <Fragment>
                <button className="btn btn-primary" onClick={this.handleSignOut}>Sign Out</button>
                {
                  this.state.schedules && (
                    <div>
                      <h2>Chartwells Hours</h2>
                      <table className="table">
                        <thead>
                          <tr>
                            <th scope="col">Location</th>
                            <th scope="col">Sunday</th>
                            <th scope="col">Monday</th>
                            <th scope="col">Tuesday</th>
                            <th scope="col">Wednesday</th>
                            <th scope="col">Thursday</th>
                            <th scope="col">Friday</th>
                            <th scope="col">Saturday</th>
                          </tr>
                        </thead>
                        <tbody>
                          {
                            this.state.schedules.map((schedule, i) => {
                              const s = [null, null, null, null, null, null, null]
                              schedule['schedules'].forEach(subSchedule => {
                                subSchedule['days'].forEach(day => {
                                  let { start_hour, start_minutes, end_hour, end_minutes } = subSchedule
                                  start_hour = start_hour > 12 ? start_hour - 12 : start_hour === 12 ? 12 : start_hour
                                  start_minutes = start_minutes === 0 ? '00' : start_minutes
                                  let _end_hour = end_hour
                                  end_hour = end_hour > 12 ? end_hour - 12 : end_hour === 0 ? 12 : end_hour
                                  end_minutes = end_minutes === 0 ? '00' : end_minutes
                                  s[day] = {
                                    "startTime": `${start_hour}:${start_minutes}am`,
                                    "endTime": `${end_hour}:${end_minutes}${_end_hour === 0 ? 'am' : 'pm'}`
                                  }
                                })
                              })
                              const _name = schedule['name'].split(' ')
                              _name.pop()
                              const name = _name.join(' ')
                              return (
                                <tr key={`schedule-${i}`}>
                                  <th scope="row">{name}</th>
                                  {s.map((day, i) => (
                                    day === null ? (
                                      <td key={`${schedule['id']}-${i}`}>
                                        Closed
                                      </td>
                                    ) : (
                                      <td key={`${schedule['id']}-${i}`}>
                                        {`${day['startTime']} - ${day['endTime']}`}
                                      </td>
                                    )
                                  ))}
                                </tr>
                              )
                            })
                          }
                        </tbody>
                      </table>
                    </div>
                  )
                }
                {
                  this.state.classSchedule && (
                    <div>
                      <h2>Schedule</h2>
                      <table className="table">
                        <thead>
                          <tr>
                            <th scope="col">Sunday</th>
                            <th scope="col">Monday</th>
                            <th scope="col">Tuesday</th>
                            <th scope="col">Wednesday</th>
                            <th scope="col">Thursday</th>
                            <th scope="col">Friday</th>
                            <th scope="col">Saturday</th>
                          </tr>
                        </thead>
                        <tbody>
                          {
                            assembleRows(this.state.classSchedule).map((row, i) => {
                              let renderRow = !row.every(v => v === null)
                              return renderRow && (
                                <tr>
                                  {row.map((c, j) => (
                                    <td key={`${i}${j}`}>{c === null ? null : c}</td>
                                  ))}
                                </tr>
                              )
                            })
                          }
                        </tbody>
                      </table>
                    </div>
                  )
                }
                <div>
                  <h2>Fenway Cash ${this.state.moolah && `${this.state.moolah}`}</h2>
                </div>
              </Fragment>
            )}
            { this.state.error !== undefined ? (
              <p className="error">{this.state.error}</p>
            ) : null }
          </div>
        </div>
      </div>
    );
  }
}

export default App;
