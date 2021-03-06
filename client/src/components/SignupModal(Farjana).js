
import React, { Component } from "react";
import '../style.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import axios from "axios";

class SignupModal extends Component {
   constructor(props, context) {
      super(props, context);

      this.state = {
      };
   }

   handleSubmit = event => {
      event.preventDefault();
      // get input field data
      const signupData = {
         email: document.getElementById('emailField').value,
         displayName: document.getElementById('displayNameField').value,
         password: document.getElementById('passwordField').value
      }
      

      const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      const isValid = regex.test(signupData.email);
      // console.log("Email validation", isValid);

      // console.log('signupData:', signupData);
     
      if(!isValid){
         document.getElementById('emailValidation-error-message').textContent = "Invalid Email";
      }        
     
      else if(signupData.password !== document.getElementById('confirmPasswordField').value ){
         document.getElementById('password-error-message').textContent = "Password does not match";
      }
      else{
      // post it to api
      axios.post('/api/auth/register', signupData)
      .then(res => {
         console.log('register res.data:', res);
         //console.log('email token:', res.data.emailToken);
         var token = res.data.emailToken;
         this.props.handleClose();
         axios.post('/api/emailNotification',token)
         .then (result => {
            console.log('Email send');
         })
      })
      .catch(err => console.log(err));
      }

     
   }

   render() {
      return (
         <div>
            <Modal show={this.props.show} onHide={this.props.handleClose}>
               <Modal.Header closeButton>
                  <Modal.Title>Signup</Modal.Title>
               </Modal.Header>
               <Form>
                  <Modal.Body>
                     <Form.Group>
                        <Form.Label>Email address</Form.Label>
                        <Form.Control id="emailField" type="email" placeholder="Enter email" />
                        <Form.Text className="text-danger error-message" id="emailValidation-error-message"> </Form.Text>
                     </Form.Group>
                     <Form.Group>
                        <Form.Label>Display Name</Form.Label>
                        <Form.Control id="displayNameField" type="text" placeholder="Enter name" />
                     </Form.Group>
                     <Form.Group>
                        <Form.Label>Password</Form.Label>
                        <Form.Control id="passwordField" type="password" placeholder="Password" />
                     </Form.Group>
                     <Form.Group>
                        <Form.Label>ConfirmPassword</Form.Label>
                        <Form.Control id="confirmPasswordField" type="confirmPassword" placeholder="confirmPassword" />
                        <Form.Text className="text-danger error-message" id="password-error-message"> </Form.Text>
                     </Form.Group>
                  </Modal.Body>
                  <Modal.Footer>
                     <Button onClick={this.handleSubmit} variant="primary" type="submit">
                        Submit
                     </Button>
                  </Modal.Footer>
               </Form>
            </Modal>
         </div>
      );
   }
}

export default SignupModal;