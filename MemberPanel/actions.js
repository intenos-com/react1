import Firebase from '../../lib/firebase';


var propertyUnsubscribe = null;
var bookingUnsubscribe = null;

export function loadApplicationForm(uid) {
  return (dispatch) => {
    let propertiesRef = Firebase.firestore().collection('properties').where("user", "==", uid)
    return propertiesRef.get().then(({ docs }) => {
      dispatch({ type: 'MEMBER_LOAD_PROPERTY', data: docs.length > 0 ? Object.assign({}, docs[0].data(), { id: docs[0].id }) : {} });
      return docs.length > 0 ? Object.assign({}, docs[0].data(), { id: docs[0].id }) : {};
    })
  }
}


export function loadProperties(uid) {
  return (dispatch) => {
    let propertiesRef = Firebase.firestore().collection('properties').where("user", "==", uid)
    propertiesRef.get().then(({ docs }) => {
      dispatch({ type: 'MEMBER_LOAD_PROPERTIES', data: docs.map((doc) => Object.assign({}, doc.data(), { id: doc.id })) });
    })
  }
}

export function getProperties() {
  return (dispatch) => {
    let propertiesRef = Firebase.firestore().collection('properties').where('status', '==', 'published')
    propertiesRef.get().then(({ docs }) => {
      dispatch({ type: 'MEMBER_LOAD_PROPERTIES', data: docs.map(doc => Object.assign({}, doc.data(), { id: doc.id })).filter((p) => p.user !== Firebase.auth().currentUser.uid) });
    })
  }
}
export function getPropertiesByMonth(month) {
  return (dispatch) => {
    let ref = Firebase.firestore().collection('properties').where("status", "==", "published");
    if (month) {
      ref = ref.where("aviability_by_month", "array-contains", month)
    }
    ref.get().then(({ docs }) => {
      dispatch({ type: 'MEMBER_LOAD_PROPERTIES', data: docs.map((doc) => Object.assign({}, doc.data(), { id: doc.id })).filter(p => p.user != Firebase.auth().currentUser.uid) });
    })
  }
}
export function clearProperties() {
  return (dispatch) => {
    dispatch({ type: 'MEMBER_LOAD_PROPERTIES', data: null });
  }
}

export function getProperty(id) {
  return (dispatch) => {
    let propertiesRef = Firebase.firestore().collection('properties').doc(id)
    propertyUnsubscribe = propertiesRef.onSnapshot(function (doc) {
      dispatch({ type: 'MEMBER_LOAD_PROPERTY', data: Object.assign({}, doc.data(), { id: doc.id }) });
    })
  }
}
export function updateProperty(data) {
  return (dispatch) => {
    dispatch({ type: 'MEMBER_UPDATE_PROPERTY', data });
  }
}

export function clearProperty() {
  return (dispatch) => {
    if (propertyUnsubscribe) {
      propertyUnsubscribe();
      propertyUnsubscribe = null;
    }
    dispatch({ type: 'MEMBER_LOAD_PROPERTY', data: null });
  }
}





export function getBookings({ role, property, member }) {
  return (dispatch) => {
    let ref = Firebase.firestore().collection('bookings');
    if (role) {
      const my_ref = Firebase.firestore().collection('users').doc(member ? member : Firebase.auth().currentUser.uid);
      ref = ref.where(role, '==', my_ref);
    }
    if (property) {
      const property_ref = Firebase.firestore().collection('properties').doc(property);
      ref = ref.where('property', '==', property_ref);
    }
    return ref.orderBy('booking_id', 'desc').get().then(({ docs }) => {
      Promise.all(docs.map(async (doc) => {
        let result = doc.data();
        result.property = await result.property.get().then((doc) => Object.assign({}, doc.data(), { id: doc.id }));
        result.member = await result.member.get().then((doc) => Object.assign({}, doc.data(), { id: doc.id }));
        result.owner = await result.owner.get().then((doc) => Object.assign({}, doc.data(), { id: doc.id }));
        result['id'] = doc.id;
        return result;
      })).then(bookings => {
        dispatch({ type: 'MEMBER_LOAD_BOOKINGS', data: bookings });
        return bookings;
      })
    })
  }
}

export function clearBookings() {
  return (dispatch) => {
    dispatch({ type: 'MEMBER_LOAD_BOOKINGS', data: null });
    return null
  }
}


export function getBooking(id) {
  return (dispatch) => {
    bookingUnsubscribe = Firebase.firestore().collection('bookings').doc(id).onSnapshot(async (doc) => {
      let booking = doc.data();
      booking.property = await booking.property.get().then((doc) => Object.assign({}, doc.data(), { id: doc.id }));
      booking.member = await booking.member.get().then((doc) => Object.assign({}, doc.data(), { id: doc.id }));
      booking.owner = await booking.owner.get().then((doc) => Object.assign({}, doc.data(), { id: doc.id }));
      booking['id'] = doc.id;
      dispatch({ type: 'MEMBER_LOAD_BOOKING', data: booking });
      return booking;
    })
  }
}

export function clearBooking() {
  return (dispatch) => {
    if (bookingUnsubscribe) {
      bookingUnsubscribe();
      bookingUnsubscribe = null;
    }
    dispatch({ type: 'MEMBER_LOAD_BOOKING', data: null });
    return null
  }
}



