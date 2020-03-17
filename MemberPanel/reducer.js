const defaultState = {
  member: {},
  properties: [],
  property: null,
  bookings: null,
  booking: null
}

export const application_form = (state = defaultState, action) => {
  switch (action.type) {
    case 'MEMBER_LOAD_PROPERTIES':
      return { ...state, properties: action.data };
    case 'MEMBER_LOAD_PROPERTY':
      return { ...state, property: action.data };
    case 'MEMBER_UPDATE_PROPERTY':
      return { ...state, property: Object.assign({}, state.property, action.data) };
    case 'MEMBER_LOAD_BOOKINGS':
      return { ...state, bookings: action.data };
    case 'MEMBER_LOAD_BOOKING':
      return { ...state, booking: action.data };
    default:
      return state
  }
}

export default application_form;