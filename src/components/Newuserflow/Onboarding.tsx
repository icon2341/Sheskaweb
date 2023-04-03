
import styles from "./Onboarding.module.css"
import React, {ChangeEvent, useEffect, useState} from "react";
import Form from "react-bootstrap/Form";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { useSwiper } from 'swiper/react';
import {useAuthState} from "react-firebase-hooks/auth";
import {auth, db} from "../../index";
import {doc, getDoc, setDoc} from "firebase/firestore";
import {NavigateFunction, useNavigate} from "react-router-dom";
import * as Yup from "yup";
import {Formik} from "formik";
import {updateProfile} from "@firebase/auth";
import firebase from "firebase/compat";
// Core modules imports are same as usual
// Direct React component imports
//TODO add email verification or phone number protocol

function SlideNextButton(props: { disability: boolean;} ) {
    const swiper = useSwiper();
    return (
        <button disabled={props.disability} className={styles.navigationButton} onClick={() => {swiper.slideNext()
                                                                            console.log('NEXT PRESSED')}}>Next</button>
    );
}

function SlidePreviousButton() {
    const swiper = useSwiper();
    return (
        <button className={styles.navigationButton} onClick={() => swiper.slidePrev()}>Prev</button>
    );
}

/**
 * Onboarding function that gets critical user data for new users.
 *
 */
export function Onboarding() {
    const validationSchema = Yup.object({
        firstname: Yup.string().required('Required'),
        lastname: Yup.string().required('Required'),
    });

    const [user, loading, error] = useAuthState(auth);
    const navigate = useNavigate();

    //TODO in the future there needs to be onboarding branches so that this app can be utilized
    //in a more sensitive way.
    //set so that the arrows dont show up
    const [txtPartnerLastname, setTxtPartnerLastname] = useState('');
    const [txtPartnerFirstname, setTxtPartnerFirstname] = useState('');
    const [txtUserFirstname, setTxtUserFirstname] = useState('');
    const [txtUserLastname, setTxtUserLastname] = useState('');
    const [nextDisabled, setNextDisabled] = useState(true);
    const handlePartnerLastname = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setTxtPartnerLastname(event.currentTarget.value);
        console.log(txtPartnerLastname);
    }

    const handlePartnerFirstname = (event:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setTxtPartnerFirstname(event.target.value);
        console.log(txtPartnerFirstname);
    }

    const handleUserFirstname = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setTxtUserFirstname(event.currentTarget.value);
        console.log(txtUserFirstname);
    }
    const handleUserLastname = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setTxtUserLastname(event.currentTarget.value);
        console.log(txtUserLastname);
    }

    //CHECKS IF USER HAS PASSED ONBOARDING ALREADY, IF SO, REDIRECTS TO DASHBOARD
    useEffect(() => {
        checkIfUserHasPassedOnboarding(navigate);
        console.log('CHECKING IF USER HAS PASSED ONBOARDING')
    }, [user]);


    // noinspection TypeScriptValidateTypes
    if(user) {
        return (
            <div>
                <style> @import url('https://fonts.googleapis.com/css2?family=Pavanam&display=swap');</style>
                <h1 className={styles.sheskaLogo}>Sheska</h1>
                <div className={styles.onboardingContainer}>
                    <Swiper allowTouchMove={false}>
                        <SwiperSlide>
                            <div className={styles.questionPane}>
                                <h1 className={styles.questionPaneTitle}>Thank you for choosing to make
                                    memories together!
                                    But first, tell us about yourself!</h1>
                                <div className={styles.navigationButtonsContainer}>
                                    <SlideNextButton disability={false}/>
                                </div>
                            </div>
                        </SwiperSlide>
                        <SwiperSlide>
                            {/*TODO this can ask for much more information and it should be refactored to utilize
                        the fancy bootstrap column crap*/}
                            <div className={styles.questionPane}>
                                <h1 className={styles.questionPaneTitle}>Just the essentials.</h1>
                                {/*<Form>*/}
                                {/*    <Form.Group className={"mb-3 w-75 mx-auto"} controlId="formBasicEmail">*/}
                                {/*        <Form.Control placeholder="Your First Name" onChange={handleUserFirstname}/>*/}
                                {/*    </Form.Group>*/}
                                {/*    <Form.Group className={"mb-3 w-75 mx-auto"}>*/}
                                {/*        <Form.Control  placeholder="Your Last Name" onChange={handleUserLastname}/>*/}
                                {/*    </Form.Group>*/}
                                {/*</Form>*/}
                                <Formik validationSchema={validationSchema}
                                        initialValues={{
                                            firstname: '',
                                            lastname: '',}}
                                        onSubmit={()=>{console.log('SUBMITTEED')}}>
                                    {({
                                        handleSubmit,
                                        handleChange,
                                        handleBlur,
                                        values,
                                        touched,
                                        isValid,
                                        errors,
                                    }) => (
                                        <Form>
                                            <Form.Group controlId={'nameForm'} className={"mb-3 w-75 mx-auto"}>
                                                <Form.Control
                                                    type={"text"}
                                                    name={"firstname"}
                                                    value={values.firstname}
                                                    onChange={(value) => {
                                                        handleChange(value)
                                                        handleUserFirstname(value)
                                                        console.log(values.firstname);
                                                        if(errors.lastname) {
                                                            setNextDisabled(true);
                                                        } else {
                                                            setNextDisabled(false);
                                                        }
                                                    }}
                                                    placeholder={"First Name"}
                                                    isValid={touched.firstname && !errors.firstname}
                                                    isInvalid={!!errors.firstname}
                                                />
                                                <Form.Control.Feedback  >Nice to meet you {values.firstname}!</Form.Control.Feedback>
                                                <Form.Control.Feedback  type={"invalid"} >{errors.firstname}</Form.Control.Feedback>

                                            </Form.Group>
                                            <Form.Group controlId={'nameForm2'} className={"mb-3 w-75 mx-auto"}>
                                                <Form.Control
                                                    type={"text"}
                                                    name={"lastname"}
                                                    value={values.lastname}
                                                    onChange={(value) => {
                                                        handleChange(value)
                                                        handleUserLastname(value)
                                                        console.log(values.lastname);
                                                        if(!isValid) {
                                                            setNextDisabled(true);
                                                        } else {
                                                            setNextDisabled(false);
                                                        }
                                                    }}
                                                    placeholder={"Last name"}
                                                    isValid={touched.lastname && !errors.lastname}
                                                    isInvalid={!!errors.lastname}
                                                />
                                                <Form.Control.Feedback  >Nice to meet you {values.lastname}!</Form.Control.Feedback>
                                                <Form.Control.Feedback  type={"invalid"} >{errors.lastname}</Form.Control.Feedback>

                                            </Form.Group>
                                        </Form>
                                    )}
                                </Formik>
                                <div className={styles.navigationButtonsContainer}>
                                    <SlidePreviousButton/>
                                    <SlideNextButton disability={nextDisabled}/>
                                </div>
                            </div>
                        </SwiperSlide>
                        <SwiperSlide>
                            <div className={styles.questionPane}>
                                <h1 className={styles.questionPaneTitle}>Do you have a partner?</h1>
                                <Form>
                                    <Form.Group className={"mb-3 w-75 mx-auto"} controlId="formBasicEmail">
                                        <Form.Control placeholder="Partner first name" onChange={handlePartnerFirstname}/>
                                    </Form.Group>
                                    <Form.Group className={"mb-3 w-75 mx-auto"}>
                                        <Form.Control  placeholder="Partner last name" onChange={handlePartnerLastname}/>
                                    </Form.Group>
                                </Form>
                                <div className={styles.navigationButtonsContainer}>
                                    <SlidePreviousButton/>
                                    <button className={styles.navigationButton} onClick={() => {sendUserOnboardingData(navigate,
                                        txtUserFirstname, txtUserLastname, txtPartnerFirstname, txtPartnerLastname)}}>Submit</button>
                                </div>
                            </div>
                        </SwiperSlide>
                    </Swiper>
                </div>
            </div>
        )
    } else if(loading) {
        //TODO need to do loading
        return (<div> <h1>Loading</h1> </div>)
    } else if(error) {
        return (
            <div><h1>Error</h1></div>
        )
    }

    return null
}


async function sendUserOnboardingData(navigate : NavigateFunction, txtUserFirstname: string, txtUserLastname: string,
                                      txtPartnerFirstname: string, txtPartnerLastname: string) {
    const user = auth.currentUser;
    if (user) {
        // take the partner data and send it to the user, take the name information, set isOnboarded to true,
        // and send the user to the home page.
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { partners: [txtUserFirstname, txtPartnerFirstname],
                                full_name: [txtUserFirstname,txtUserLastname],
                                passedOnboarding: true}, { merge: true }).then(() => {
                                    updateProfile(user, {
                                        displayName: txtUserFirstname,
                                    });

        })

        navigate('/dashboard')
    }
}

async function checkIfUserHasPassedOnboarding(navigate : NavigateFunction) {
    const userRef = doc(db, 'users', auth?.currentUser?.uid ?? "")
    //determines where to redirect user
    await getDoc(userRef).then(doc => {
        if (doc.exists()) {
            console.log("doc exists, check onboarding", doc.data())
            // make sure user has passed onboarding, redirects them accordingly
            if(doc.data()?.passedOnboarding === false ||
                doc.data()?.passedOnboarding === undefined) {
                console.log("user has not passed onboarding")
                return;
            } else {
                navigate('/dashboard')
            }
        } else {
            throw new Error("User does not exist")

        }
    })
}