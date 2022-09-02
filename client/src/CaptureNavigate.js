import { register } from 'client/util/registry'
import { useNavigate } from 'react-router-dom'
export const CaptureNavigate = () =>
{
  const navigate = useNavigate()
  register('navigate', navigate)
  return null
}