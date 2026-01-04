import axios from 'axios';
import { showAlert } from './alert';

const stripe = window.Stripe(
  'pk_test_51Skp9y0A9jLSMUFMfQhlZsMivNVnzwSTpcBQtZdc9f0NwEcOBQ4wvVbbnkwVkCV3uIXi9w0Iz69vwoYZWCae9gQU00Xw3SuMTT'
);

export const bookTour = async (tourId) => {
  try {
    const session = await axios(
      `/api/v1/bookings/checkout-session/${tourId}`
    );
    window.location.href = session.data.session.url;
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
