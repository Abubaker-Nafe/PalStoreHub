
import { Navbar } from '../Components/UI/Navbar'
import { Outlet } from 'react-router-dom'

export default function Root() {
  return (
    <>
    <Navbar/>
    <Outlet/>
    </>
  )
}
