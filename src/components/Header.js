import React from 'react';
// import { Link } from 'react-router-dom';
import icon from '../assets/favicons/favicon-32x32.png';
// import { Container, Offcanvas, Navbar, Nav, NavDropdown, Form, Button  } from 'react-bootstrap';
import styled from 'styled-components';




const StyledMenu = styled.nav`
  display: flex;
  flex-direction: column;
  justify-content: start;
  background: linear-gradient(to bottom, rgba(0,0,85, 0.3), transparent);
  transform: ${({ open }) => open ? 'translateX(0)' : 'translateX(100%)'};
  height: 100vh;
  text-align: left;
  padding: 5vh 1rem 1rem 1rem;; 
  position: absolute;
  top: 0;
  right: 0;
  transition: transform 0.3s ease-in-out;
  @media (max-width: 576px) {
      width: 100%;
    }

  a {
    font-size: 1rem;
    text-transform: uppercase;
    padding: 1rem 0;
    font-weight: bold;
    letter-spacing: 0.1rem;
    color:#EFFFFA;
    text-decoration: none;
    transition: color 0.3s linear;

    @media (max-width: 576px) {
      font-size: 1.5rem;
      text-align: center;
    }

    &:hover {
      color: #9292dd;
    }
  }
`
const useOnClickOutside = (ref, handler) => {
  React.useEffect(() => {
    const listener = event => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
    };
  },
  [ref, handler],
  );
};



const StyledBurger = styled.button`
  position: absolute;
  right: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 5;

  &:focus {
    outline: none;
  }

  div {
    width: 2rem;
    height: 0.25rem;
    background: ${({ open }) => open ? '#EFFFFA' : 'rgb(0,0,85)'};
    border-radius: 10px;
    transition: all 0.3s linear;
    position: relative;
    transform-origin: 1px;


    &:first-child {
      transform: ${({ open }) => open ? 'rotate(45deg)' : 'rotate(0)'};
    }

    &:nth-child(2) {
      opacity: ${({ open }) => open ? '0' : '1'};
      transform: ${({ open }) => open ? 'translateX(20px)' : 'translateX(0)'};
    }

    &:nth-child(3) {
      transform: ${({ open }) => open ? 'rotate(-45deg)' : 'rotate(0)'};
    }
  }

  @media (min-width: 1000px) {
    display: none;
  }
`
const Burger = ({ open, setOpen }) => {
  return (
    <StyledBurger open={open} onClick={() => setOpen(!open)}>
      <div/>
      <div />
      <div/>
    </StyledBurger>
  )
}

const Menu = ({ open, setOpen }) => {
  return (
    <StyledMenu open={open}>
      <a href="/" onClick={() => setOpen(false)}>
        <span role="img" aria-label="about us">💁🏻‍♂️</span>
        Profile
      </a>
      <a href="/" onClick={() => setOpen(false)}>
        <span role="img" aria-label="education">📖</span>
        Education
      </a>
      <a href="/" onClick={() => setOpen(false)}>
        <span role="img" aria-label="price">💸</span>
        Projects
      </a>
      <a href="/" onClick={() => setOpen(false)}>
        <span role="img" aria-label="contact">📩</span>
        Contact Me
      </a>
    </StyledMenu>
  )
}

const Header = () => {
  const [open, setOpen] = React.useState(false);
  const node = React.useRef();
  useOnClickOutside(node, () => setOpen(false));

  return (
    <header className='menu'>
      <div className='logo'>
        <a href="/"><img className="icon" src={icon} alt="logo" /></a>
      <div ref={node}>
        <Burger open={open} setOpen={setOpen} />
        <Menu open={open} setOpen={setOpen} />
      </div>
      </div>
    </header>
  );
};

export default Header;

