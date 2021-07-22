import React from 'react';
import './Modal.css';

const Modal = ({handleClose, show, children}) => {
  const className = show ? "modal display-block" : "modal display-none";

  return (
    <div className={className}>
      <section className="modal-main">
        {children}
        <button type="button" onClick={handleClose}>Close</button>
      </section>
    </div>
  )
}
export default Modal;