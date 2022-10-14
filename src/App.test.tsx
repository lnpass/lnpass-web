import { render, screen } from '@testing-library/react'
import App from './App'

it('should render welcome message', () => {
  render(<App />)
  const linkElement = screen.getByText(/welcome/i)
  expect(linkElement).toBeInTheDocument()
})
