import { render, screen } from '@testing-library/react'
import App from './App'

test('renders weclome message', () => {
  render(<App />)
  const linkElement = screen.getByText(/welcome/i)
  expect(linkElement).toBeInTheDocument()
})
