import React, { Component, Fragment } from 'react';
import './App.css';

async function fakeAuth(email) {
  if (email.indexOf('@') === -1) {
    throw new Error('Invalid email')
  }
  return 'abcde'
}
class App extends Component {
  state = {
    email: '',
    token: undefined,
    error: undefined,
    schedules: undefined
  }

  handleChange = (event) => {
    this.setState({email: event.target.value})
  }

  handleSubmit = (event) => {
    this.setState({ error: undefined })
    fakeAuth(this.state.email)
      .then(token => this.setState({ token }))
      .catch(error => this.setState({ error: error.message }))

    const chartiesUrl = `https://api.dineoncampus.com/v1/locations/open?site_id=5751fd3390975b60e048938a&timestamp=${new Date(Date.now()).toISOString()}`
    fetch(chartiesUrl)
      .then(res => res.json())
      .then(data => {
        const schedules = data['location_schedules']
        console.log(schedules)
        this.setState({schedules})
      })

    // fetch('/schedule')
    //   .then(res => res.json())
    //   .then(data => console.log(data))

    // fetch('/moolah')
    //   .then(res => res.json())
    //   .then(data => console.log(data))

    event.preventDefault()
  }

  handleSignOut = () => {
    this.setState({ token: undefined, email: '' })
  }

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-10 col-md-8 offset-md-2">
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
                    name={this.state.value}
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
                            this.state.schedules.map(schedule => {
                              const s = [null, null, null, null, null, null, null]
                              schedule['schedules'].forEach(subSchedule => {
                                subSchedule['days'].forEach(day => {
                                  const { start_hour, start_minutes, end_hour, end_minutes } = subSchedule
                                  s[day] = {
                                    "startTime": `${start_hour}:${start_minutes === 0 ? '00' : start_minutes}`,
                                    "endTime": `${end_hour}:${end_minutes === 0 ? '00' : end_minutes}` 
                                  }
                                })
                              })
                              return (
                                <tr>
                                  <th scope="row">{schedule['name']}</th>
                                  {s.map((day, i) => (
                                    day === null ? (
                                      <td key={`${schedule['id']}-${i}`}>
                                        Closed
                                      </td>
                                    ) : (
                                      <td key={`${schedule['id']}-${i}`}>
                                        {`${day['startTime']}-${day['endTime']}`}
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
                
                
                <div>
                  <h2>Schedule</h2>
                </div>

                <div>
                  <h2>Fenway Cash</h2>
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
