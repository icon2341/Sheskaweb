import React from 'react'
import {useNavigate} from "react-router-dom";
import {auth, db, functions} from "../../index";
import styles from "./AuthStyles.module.scss"
import { Button } from "src/components/ui/button";
import Form from 'react-bootstrap/Form';
import {InputGroup} from "react-bootstrap";
import {useAuthState} from "react-firebase-hooks/auth";
import {Formik} from "formik";
import * as Yup from 'yup';
import LoadingScreen from "src/components/Utils/LoadingUtils/LoadingScreen";
import {createAccount} from "../../api/User/Auth/AuthUtils";

export function SignUp() {


    const validationSchema = Yup.object({
        email: Yup.string().email('Invalid email address').required('Required'),
        password: Yup.string().required('Required')
            .min(8, 'Password is too short - should be 8 chars minimum.')
            .matches(/[0-9]/, 'Password requires a number')
            .matches(/[a-z]/, 'Password requires a lowercase letter')
            .matches(/[A-Z]/, 'Password requires an uppercase letter')
            .matches(/[^\w]/, 'Password requires a symbol'),
        confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Passwords must match')
    });

    /**
     * navigation object
     */
    const navigate = useNavigate();
    const [checked,setChecked] = React.useState(false);
    const [showPass, setShowPass] = React.useState(false);

    const handleSubmit = async (values: any, { setErrors } : any) => {
        //login the user and return a promise that can do two things on error (for now, here is where you add error handling)

        createAccount(values.email, values.password, navigate, checked).catch((reason) => {
            console.log("LOL", reason.code)
            if (reason === "Email in Use") {
                setErrors({email: 'Email already in use'})
            } else if (reason === "Error adding user to database") {
                setErrors({email: 'Error adding user to database, contact support at www.sheska.co/support'})
            } else if (reason === "Server Refused Connection") {
                setErrors({email: 'Server Refused Connection, try again later. Or Visit www.sheska.co/support for help.'})
            }
        });

    };

    const [user, loading, error] = useAuthState(auth);
    if (user) {
        navigate('/home');
        return(<div>
            <LoadingScreen/>
        </div>)
    } else if (loading) {
        return (<div>
            <LoadingScreen/>
        </div>)
    } else {
        return(
            <div>
                <style> @import url('https://fonts.googleapis.com/css2?family=Pavanam&display=swap');</style>
                <div className={styles.pageContainer}>
                    <div className={styles.presentationContainer}>
                        <img src={require("../../images/peopleHavingFun.jpg")} className={styles.peopleHavingFun} alt={'people having fun'}/>
                        <h1 className={styles.presentationHeader}>Give guests one of a kind experiences, find amazing vendors, allow guests to support you, make memories together.</h1>
                    </div>
                    <div className={styles.formContainer}>
                        <div className={styles.loginWidget}>
                            <div className={styles.loginWidgetHeader}>
                                <h1 className={styles.loginLogo}>Sheska</h1>
                                <h2 className={styles.loginSubText}>Memories are made together</h2>
                                <h3 className={styles.loginSubSubText}>Sign Up</h3>
                            </div>
                            <div className={`${styles.loginWidgetFormContainer}`}>
                                <Formik validationSchema={validationSchema}
                                        onSubmit={handleSubmit}
                                        initialValues={{
                                            email: '',
                                            password: '',
                                            confirmPassword: ''}}>
                                    {({
                                            handleSubmit,
                                            handleChange,
                                            handleBlur,
                                            values,
                                            touched,
                                            isValid,
                                            errors,
                                    }) => (
                                        <Form noValidate onSubmit={handleSubmit}>
                                            <Form.Group controlId={"lemonForm01"} className={"mb-3 w-50 mx-auto"}>
                                                <Form.Control
                                                    type={"email"}
                                                    name={"email"}
                                                    value={values.email}
                                                    onChange={handleChange}
                                                    placeholder={"Email"}
                                                    isValid={touched.email && !errors.email}
                                                    isInvalid={!!errors.email}
                                                    autoComplete={"email"}
                                                    />
                                                <Form.Control.Feedback  >Looks good!</Form.Control.Feedback>
                                                <Form.Control.Feedback  type={"invalid"} >{errors.email}</Form.Control.Feedback>
                                            </Form.Group>
                                            <Form.Group controlId={"lemonForm02"} className={"mb-3 w-50 mx-auto"}>
                                                <InputGroup>
                                                    <Form.Control
                                                        type={showPass ? "text" : "password"}
                                                        name={"password"}
                                                        value={values.password}
                                                        onChange={handleChange}
                                                        placeholder={"Password"}
                                                        isValid={touched.password && !errors.password}
                                                        isInvalid={!!errors.password}
                                                        autoComplete={"new-password"}
                                                    />
                                                    {/*TODO this is square and it anmoys me*/}
                                                    <InputGroup.Text>

                                                        <i onClick={() => {
                                                            setShowPass(!showPass)
                                                        }}>
                                                            <i className={showPass ? 'fa fa-eye-slash' : 'fa fa-eye'}></i>
                                                        </i>
                                                    </InputGroup.Text>
                                                    <Form.Control.Feedback  >Looks good!</Form.Control.Feedback>
                                                    <Form.Control.Feedback  type={"invalid"} >{errors.password}</Form.Control.Feedback>
                                                </InputGroup>

                                            </Form.Group>
                                            <Form.Group controlId={"lemonForm03"} className={"mb-3 w-50 mx-auto"}>
                                                <Form.Control
                                                    type={showPass ? "text" : "password"}
                                                    name={"confirmPassword"}
                                                    value={values.confirmPassword}
                                                    onChange={handleChange}
                                                    placeholder={"Confirm Password"}
                                                    isValid={touched.confirmPassword && !errors.confirmPassword}
                                                    isInvalid={!!errors.confirmPassword}
                                                    autoComplete={"new-password"}
                                                />
                                                <Form.Control.Feedback  >Looks good!</Form.Control.Feedback>
                                                <Form.Control.Feedback  type={"invalid"} >{errors.confirmPassword}</Form.Control.Feedback>

                                            </Form.Group>
                                            {/*<button className="btn btn-primary" type="submit">Submit form</button>*/}
                                                <div className={"d-flex justify-content-center"}>
                                                    <Button disabled={!!errors.email || !!errors.password || !!errors.confirmPassword} type={"submit"} id={"button-signup"} className={`${"d-block w-50 mx-auto text-center"} 
                                                    ${styles.loginButton}`}>
                                                        Submit
                                                    </Button>
                                                </div>

                                        </Form>
                                        )}
                                </Formik>

                                <div className={styles.loginWidgetFooter}>
                                    <h2 className={`${styles.passwordFooter} ${'text-muted'}`}>Passwords must be at least 8 characters long, contain upper and lowercase letters, numbers, and at least one special character</h2>
                                    <br/>
                                    <small className={`${styles.passwordFooter} ${'text-muted'}`}>Already have an account?</small>
                                    <button className={`${styles.signInButt}`} onClick={() => {navigate('/login')}}>Log In!</button>
                                </div>





                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}

export default SignUp




