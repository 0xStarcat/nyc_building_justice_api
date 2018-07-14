import React, { Component } from 'react'
import { connect } from 'react-redux'
import SideBar from './SideBar'
import MapPage from './Pages/MapPage'
import ChartPage from './Pages/ChartPage'
import AboutPage from './Pages/AboutPage'

import { readCensusTracts } from './Store/CensusTracts/actions'
import { readNeighborhoods } from './Store/Neighborhoods/actions'

import { history } from './Store/store'
import { Router, Switch, Route } from 'react-router'

import './App.scss'

class App extends Component {
  componentWillMount() {
    this.props.dispatch(readCensusTracts())
    this.props.dispatch(readNeighborhoods())
    this.baseUrl = process.env.REACT_APP_PUBLIC_URL // will be /hypercomp
  }

  render() {
    if (!(this.props.store.censusTracts.initialFetchCompleted || this.props.store.neighborhoods.initialFetchCompleted))
      return <div>Loading</div>
    return (
      <div className="App">
        <Router history={history}>
          <Switch>
            <Route exact path={`${this.baseUrl}/`} render={routeProps => <MapPage store={this.props.store} />} />
            <Route
              exact
              path={`${this.baseUrl}/charts`}
              render={routeProps => <ChartPage store={this.props.store} />}
            />
            <Route exact path={`${this.baseUrl}/about`} render={routeProps => <AboutPage />} />
          </Switch>
        </Router>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    store: state
  }
}

export default connect(
  mapStateToProps,
  null
)(App)
