import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders app successfully', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const profileText = screen.getByText(/KRISHNA VAIBHAV/i);
  expect(profileText).toBeInTheDocument();
});
