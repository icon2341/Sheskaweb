import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from 'firebase/auth';
import React, {ChangeEvent, useState} from 'react'
import {NavigateFunction, useNavigate} from "react-router-dom";
import { doc, setDoc} from "firebase/firestore";
import {useAuthState} from "react-firebase-hooks/auth";
import {auth, db} from "../../index";
import styles from "./SignUp.module.css"
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
//TODO add firestore, store password and username functionality as well as next steps to proper profile creation.
//TODO ADD NEW PASSWORD SYSTEM
//TODO ADD COOKIES REMEMEMBER ME OK

export function SignUp() {
    const navigate = useNavigate();
    const [txtEmail, setTxtEmail] = useState('')
    const [txtPassword, setTxtPassword] = useState('')

    const handleEmail = (event: ChangeEvent<HTMLInputElement>) => {
        setTxtEmail(event.currentTarget.value);
        console.log(txtEmail);
    }

    const handlePassword = (event:ChangeEvent<HTMLInputElement>) => {
        setTxtPassword(event.target.value);
        console.log(txtPassword);
    }

    const [user, loading, error] = useAuthState(auth);

    return(
        <div>
            <style> @import url('https://fonts.googleapis.com/css2?family=Pavanam&display=swap');</style>
            <div className={styles.pageContainer}>
                <div className={styles.presentationContainer}>
                    <img src={require("../../images/peopleHavingFun.jpg")} className={styles.peopleHavingFun}/>
                    <h1 className={styles.presentationHeader}>Give guests one of a kind experiences, find amazing vendors, allow guests to support you, make memories together.</h1>
                </div>
                <div className={styles.formContainer}>
                    <div className={styles.loginWidget}>
                        <div className={styles.loginWidgetHeader}>
                            <h1 className={styles.loginLogo}>Sheska</h1>
                            <h2 className={styles.loginSubText}>Memories are made together</h2>
                            <h3 className={styles.loginSubSubText}>Log in</h3>
                        </div>
                        <div className={`${styles.loginWidgetFormContainer}`}>
                            <Form>
                                <Form.Group className="mb-3 w-75 mx-auto" controlId="formBasicEmail">
                                    <Form.Control type="email" placeholder="Enter email" onChange={handleEmail}/>
                                </Form.Group>
                                <Form.Group className={"mb-3 w-75 mx-auto"}>
                                    <Form.Control type="password" placeholder="Password" onChange={handlePassword}/>
                                </Form.Group>
                                <Form.Group className={`${"mb-3 d-flex justify-content-center"} ${styles.loginWidgetCheckbox}`} controlId="formBasicCheckbox">
                                    <Form.Check type="checkbox" label="Remember Me"/>
                                </Form.Group>
                                <div className={"d-flex justify-content-center"}>
                                    <Button variant="primary" id={"button-signup"} className={`${"d-block w-75 mx-auto text-center"} ${styles.loginButton}`} onClick={() => createAccount(txtEmail,txtPassword, navigate)}>
                                        Submit
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignUp


async function createAccount(txtEmail : string, txtPassword : string, navigate : NavigateFunction) {

    console.log(`Signup Attempted on ${txtEmail}`)
    const email : string = txtEmail
    const password : string = txtPassword
    try {
        await createUserWithEmailAndPassword(auth, email, password).then((cred) => {
            console.log(cred)
            sessionStorage.setItem('Auth Token', cred.user.refreshToken)

            const userRef = doc(db, 'users', auth?.currentUser?.uid ?? "")
            console.log("adding to doc...")
            return (
                setDoc(userRef, {email: email}, {merge: true})
            ).then(() => {
                console.log("signing up completed for: ", auth?.currentUser?.uid ?? "ERROR NULL USER")
                navigate('/dashboard')
            });
        })
    }
    catch(error) {
        try {
            await signInWithEmailAndPassword(auth, email, password)
            console.log("signed in my friend")
            navigate('/dashboard')
        } catch (error) {
            console.log(`There was an error: ${error}`)
        }
    }

}




