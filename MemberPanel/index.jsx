import React from 'react';
import './index.scss';
import { connect } from 'react-redux';
import { Switch, Route } from 'react-router-dom'

import ApplicationForm from './components/ApplicationForm';
import Profile from './components/Profile';
import UpdateProperty from './components/UpdateProperty';
import CreateProperty from './components/CreateProperty';
import Properties from './components/Properties';
import Header from '../../components/Header';
import Drawer from '../../components/Drawer';
import Sidebar from '../../components/Sidebar';

import Property from './components/Property';
import Bookings from './components/Bookings';
import Booking from './components/Booking';

import Cookies from '../../components/Cookies';
import Spinner from '../../components/Spinner';


class MemberPanel extends React.Component {
  state = {};
  render() {
    const { profile } = this.props;
    if(!profile){
      return <div className="app-page loading" ><Spinner contained={true} /></div>
    }
    return (
      <div className="app-admin-panel">
        <Header handlerMenuButton={() => { this.setState({ drawer: true }) }} />
        <Drawer handleDrawerClose={() => { this.setState({ drawer: false }) }} open={this.state.drawer} />
        <Sidebar />
        <Switch>
          {
            !profile.status || profile.status === 'request' || profile.status === 'pending' ? <Route path="/member" component={ApplicationForm} />
              :
              profile.status === 'declined' || profile.status === 'blocked' ? <Route path="/member" component={Profile} />
                :
                [
                  <Route exect path="/member/properties/new" component={CreateProperty} />,
                  <Route path="/member/properties/edit/:id" component={UpdateProperty} />,
                  <Route path="/member/properties/:id" component={Property} />,
                  <Route path="/member/properties" component={Properties} />,
                  <Route path="/member/bookings/:id" component={Booking} />,
                  <Route path="/member/bookings" component={Bookings} />,
                  <Route exect path="/member" component={Profile} />,
                ]
          }
        </Switch>
        <Cookies />
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  profile: state.auth.profile
})
const mapDispatchToProps = {
}
export default connect(mapStateToProps, mapDispatchToProps)(MemberPanel);
