import React from 'react';
import './index.scss';
import { connect } from 'react-redux';
import Firebase from '../../lib/firebase';
import LoadingButton from '../LoadingButton';
import { reduxForm, Field, SubmissionError } from 'redux-form';
import FieldInput from '../FormField/FieldInput'
import FieldDate from '../FormField/FieldDate'
import FieldSelect from '../FormField/FieldSelect';
import Swal from 'sweetalert2';
import CancelRoundedIcon from '@material-ui/icons/CancelRounded';
import moment from 'moment';

class PriceForm extends React.Component {
  constructor(props) {
    super(props)
    if (props.context) {
      props.context(this);
    }
    this.state = { loading: false }
  }

  addItem = () => {
    let { return_form, change } = this.props;
    let price = return_form.price ? return_form.price : [];
    const result = [...price, { season: 'high' }];
    change('price', result);
  }
  removeItem = (index) => {
    let { return_form, change } = this.props;
    let price = return_form.price ? return_form.price : [];

    const result = [...price.slice(0, index), ...price.slice(index + 1)];
    change('price', result);
  }

  validatePrices = (price) => {
    return Promise.resolve().then(() => {
      price.map((p, index) => {
        if (!p.price || p.price === "" || !p.from || !p.to || !p.fee || p.fee === "") {
          throw new SubmissionError({
            [`price[${index}].price`]: !p.price || p.price === "" ? 'It is requred field.' : null,
            [`price[${index}].from`]: !p.from ? 'It is requred field.' : null,
            [`price[${index}].to`]: !p.to ? 'It is requred field.' : null,
            [`price[${index}].fee`]: !p.fee || p.fee === "" ? 'It is requred field.' : null
          })
        }
      })
      return true;
    })
  }


  calcPerls = (aviability, prices) => {
    let result = { high: 0, high_count: 0, low: 0, low_count: 0 };
    prices.map(p => {
      let weeks = aviability.filter(start => moment(start, 'DD/MM/YYYY').isSameOrAfter(moment(p.from, 'DD/MM/YYYY')) && moment(start, 'DD/MM/YYYY').isSameOrBefore(moment(p.to, 'DD/MM/YYYY')))
      if (weeks.length === 0) {
        return null;
      } else {
        if (p.season === 'low') {
          result['low'] += weeks.length * parseFloat(p.price);
        } else {
          result['high'] += weeks.length * parseFloat(p.price);
        }
      }
    })
    return result;
  }

  Submit = () => {
    const { handleSubmit } = this.props;
    return new Promise((resolve, reject) => {
      handleSubmit(({ price }) => {
        return this.validatePrices(price ? price : []).then(() => resolve({ price })).catch(err => { reject(err); throw err; })
      })()
    })
  }



  onSubmit = ({ price }) => {
    const { property } = this.props;
    return this.validatePrices(price).then(() => {
      this.setState({ loading: true })


      Swal.fire({
        title: 'Make sure to double check the prices you have entered',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#4E7FED',
        cancelButtonColor: '#FA7268',
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.value) {

          if(property.status === 'published'){
            let old_pearls = this.calcPerls(property.aviability, property.price ? property.price : []);
            let new_pearls = this.calcPerls(property.aviability, price);
            let change_high = new_pearls['high'] - old_pearls['high'];
            if (change_high !== 0) {
              let userRef = Firebase.firestore().collection('users').doc(property.user);
              userRef.get().then(doc => {
                let history = doc.data().history ? doc.data().history : [];
                userRef.set({
                  history: [{
                    title: `Change price per week in High Season (`+property.name+')',
                    total: change_high,
                    date: moment().format('DD/MM/YYYY'),
                    status: 'done'
                  }, ...history]
                }, { merge: true })
              })
            }
          }
         
          return Firebase.firestore().collection('properties').doc(property.id).set({ price }, { merge: true });
        }
        this.setState({ loading: false })
      });
    })
  }


  validateStartDate = (current_start, name) => {
    const { return_form: { price } } = this.props;
    const index = /price\[(.*?)\].from/.exec(name)[1];
    return Promise.all(price.map((price, map_index) => {
      if (price.from && price.to && map_index !== parseInt(index)) {
        const start = moment(price.from, 'DD/MM/YYYY')
        const end = moment(price.to, 'DD/MM/YYYY')
        if ((current_start.isBefore(end) && current_start.isAfter(start)) || (current_start.isSame(start) || current_start.isSame(end))) {
          return Promise.reject('Periods can`t overlap.');
        }
      }
      return Promise.resolve();
    }))
  }

  validateEndDate = (current_end, name) => {
    const { return_form: { price } } = this.props;
    const index = /price\[(.*?)\].to/.exec(name)[1];
    const current_start = moment(price[index].from, 'DD/MM/YYYY');

    if ((current_end.isBefore(current_start) || current_end.format('DD/MM/YYYY') === current_start.format('DD/MM/YYYY'))) {
      return Promise.reject('Incorect period.');
    }

    return Promise.all(price.map((price, map_index) => {
      if (price.from && price.to && map_index !== parseInt(index)) {
        const start = moment(price.from, 'DD/MM/YYYY')
        const end = moment(price.to, 'DD/MM/YYYY')
        if ((current_end.isBefore(end) && current_end.isAfter(start)) || (current_end.isSame(start) || current_end.isSame(end))) {
          return Promise.reject('Periods can`t overlap.');
        }
        if ((current_start.isBefore(start) && current_end.isAfter(end))) {
          return Promise.reject('Periods can`t overlap.');
        }
      }
      return Promise.resolve();
    }))
  }


  render() {
    const { handleSubmit, readOnly, loading, i18n, return_form, return_errors, hide_save_button } = this.props;
    let errors = return_errors ? return_errors : {};
    if (readOnly) {
      return null;
    }
    return (
      <div className="app-price">
        <div className="app-price-header" >
          <div className="app-price-title">{i18n.translate("Price / Week")}</div>
        </div>
        <div className="app-price-body">

          {
            !return_form.price ? null :
              return_form.price.map((item, index) => {
                return (
                  <div className="input-row" key={"price-form-" + index}>
                    <Field name={`price[${index}].from`} component={FieldDate} readOnly={readOnly} label="From" force_error={errors[`price[${index}].from`]} validateField={this.validateStartDate} />
                    <Field name={`price[${index}].to`} component={FieldDate} readOnly={readOnly} label="To" force_error={errors[`price[${index}].to`]} validateField={this.validateEndDate} />
                    <Field name={`price[${index}].season`} component={FieldSelect} readOnly={readOnly} label="Season" options={[{ title: 'Very High', value: 'very_high' }, { title: 'High', value: 'high' }, { title: 'Low', value: 'low' }]} />
                    <Field name={`price[${index}].fee`} component={FieldInput} readOnly={readOnly} label="Booking fee (€)" force_error={errors[`price[${index}].fee`]} />
                    <Field name={`price[${index}].price`} component={FieldInput} readOnly={readOnly} label="Pearl" force_error={errors[`price[${index}].price`]} />
                    {readOnly || return_form.price.length === 1 ? null : <CancelRoundedIcon onClick={() => this.removeItem(index)} />}
                  </div>
                )
              })
          }
          {
            readOnly ? null :
              <div>
                <button type="button" className="button-outline center file" onClick={this.addItem}>{i18n.translate("Add item")}</button>
              </div>
          }
        </div>
        {
          readOnly || hide_save_button ? null :
            <div className="input-row reverse">
              <LoadingButton loading={loading} onClick={() => handleSubmit(this.onSubmit)()}  >{i18n.translate('Save')}</LoadingButton>
            </div>
        }
      </div>
    );
  }
}


PriceForm = reduxForm({
  form: 'property_price',
  enableReinitialize: true,
})(PriceForm);


const mapStateToProps = (state, ownProps) => ({
  i18n: state.auth.i18n,
  return_form: state.form.property_price ? state.form.property_price.values : {},
  return_errors: state.form.property_price ? state.form.property_price.submitErrors : {},
  initialValues: ownProps.property ? ownProps.property : state.member.property ? state.member.property : { price: [] }
})

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(PriceForm);



