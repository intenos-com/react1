import React from 'react';
import { connect } from 'react-redux';
import Block from '@material-ui/icons/Block';
import Button from '@material-ui/core/Button';

import StepsProgressBar from '../../../../components/StepsProgressBar';
import PersonalDetailsForm from '../../../../components/PersonalDetailsForm';
import PropertiesGrid from '../../../../components/PropertiesGrid';
import AdministrativeDetailsForm from '../../../../components/AdministrativeDetailsForm'
import Wallet from '../../../../components/Wallet';
import Spinner from '../../../../components/Spinner';

import Firebase from '../../../../lib/firebase';
import { loadProperties, clearProperties } from '../../actions';

import Swal from 'sweetalert2'

const statuses = [{ title: "Request" }, { title: "In process" }, { title: "Active" }];

class Profile extends React.Component {

  componentDidMount() {
    this.props.loadProperties(Firebase.auth().currentUser.uid);
  }
  componentWillUnmount() {
    this.props.clearProperties();
  }

  submitPersonalData = (values) => {
    return Firebase.firestore().collection('users').doc(Firebase.auth().currentUser.uid).set(values, { merge: true });
  }

  render() {
    const { profile, properties, i18n } = this.props;
    if (!profile || !properties){
      return <div className="app-page loading" ><Spinner contained={true} /></div>;
    }

    const { first, last, status } = profile;
    if (['blocked', 'declined'].includes(status)) {
      return (
        <main className="app-page">
          <div className="app-page-content center">
            <div className="app-member-blocked">
              <Block className="app-member-blocked-icon" />
              <div className="app-member-blocked-text">{i18n.translate("Your account has been " + status)}</div>
              <Button variant="contained" color="primary" onClick={() => { Swal.fire({ type: 'info', html: 'Please contact SPHERE team at info@spheretravelclub.com or +32 485 946 984.' }) }}>
                {i18n.translate("Contact Support")}
              </Button>
            </div>
          </div >
        </main>
      );
    }

    return (
      <main className="app-page">
        <div className="app-page-content">
          <div className="app-page-header" >
            <div className="app-page-header-title">{first} {last}</div>
          </div>
          <StepsProgressBar steps={statuses} indicator={true} current={status} />
          <PersonalDetailsForm onSubmit={this.submitPersonalData} />
          <Wallet profile={profile} />
          <PropertiesGrid properties={properties} showCreateNewButton={true} path="/member/properties/edit" create_path="/member/properties/new" markDraft={true} />
          <AdministrativeDetailsForm personal_data={profile} />
        </div>
      </main>
    );
  }

}

const mapStateToProps = (state, ownProps) => ({
  profile: state.auth.profile,
  properties: state.member.properties,
  i18n: state.auth.i18n
})

const mapDispatchToProps = {
  loadProperties,
  clearProperties
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
