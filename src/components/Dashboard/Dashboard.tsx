
import styles from './Dashboard.module.css'
import {useAuthState} from "react-firebase-hooks/auth";
import {auth, db} from "../../index";
import Masonry from '@mui/lab/Masonry';
import {Box} from "@mui/material";
import {getFirestore, collection, query, where, doc, getDoc} from 'firebase/firestore';
import { getDocs } from "firebase/firestore";
import {useEffect, useState} from "react";
import {unmountComponentAtNode} from "react-dom";

export function Dashboard() {
    // TODO CLEAN THIS UP, ADD LINKS ETC.
    const [user, loading, error] = useAuthState(auth);

    const [partners, setPartners] = useState([]);

    async function getPartners(uid: string | undefined) {
        const docRef = doc(db, "users", uid + "" );
        console.log('getting partners')
        const docSnapshopt = await getDoc(docRef).then(doc => {
            if(doc.exists()) {
                console.log("Document data:", doc.data());
                setPartners(doc.data().partners)
            } else {
                console.log("No such document!");
            }
        })


    }

    useEffect(() => {
        console.log('attempting get partners with user: ' + user?.uid)
        getPartners(user?.uid).then(r => console.log('partners: ' + r))

    }, [user]);
    useEffect(() => {
        console.log('attempting get partners with user: ' + user?.uid)
        getPartners(user?.uid).then(r => console.log('partners: ' + r))

    }, []);

    if (user && partners) {
        return (
            <Box id={styles['box']}>
                <style> @import url('https://fonts.googleapis.com/css2?family=Pavanam&display=swap');</style>
                <style> @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700&display=swap');
                </style>
                <link rel="stylesheet"
                      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0"/>
                <a id={styles["email-display"]}>{user?.email} Dashboard </a>
                <Masonry columns={{md: 2, xs: 1}} spacing={2} id={styles['grid']}>
                    <div className={`${styles.welcomeSpace} ${styles.gridItem}`}>
                        <h1 id={styles["hello-message"]}> Welcome {partners[0]} and {partners[1]}!</h1>
                        <h2 id={styles["start-here-message"]}> Start Here.</h2>
                    </div>
                    <div className={`${styles.largeFeatureCard} ${styles.gridItem}`}>
                        <a>Guest List</a>
                        <p>View and manage guests, dining, seating, and invitations.</p>
                        <img src={require("../../images/guestListImage.jpg")} id={styles["feature-card-image-guest"]}/>
                    </div>
                    <div className={`${styles.largeFeatureCard} ${styles.gridItem}`}>
                        <a>Sheska List</a>
                        <p>Create beautiful cards to showcase items your guests can donate to.</p>
                        <img src={require("../../images/weddingVenueExample.webp")}
                             id={styles["feature-card-image-sheska"]}/>
                    </div>
                    <div className={`${styles.smallFeatureCard} ${styles.gridItem}`}>
                        <a>Event Information</a>
                        <p>Create informative panels to guide your guests on your special day.</p>
                        <svg className={styles.arrow} height="48" width="48">
                            <path fill="white"
                                  d="m28.05 35.9-2.15-2.1 8.4-8.4H8v-3h26.3l-8.45-8.45 2.15-2.1L40.05 23.9Z"/>
                        </svg>
                    </div>
                    <div className={`${styles.simpleFeatureCard} ${styles.gridItem}`}>
                        <a>Event Preferences</a>
                        <p>Set up your event preferences and customize your event.</p>
                    </div>
                    <div className={`${styles.simpleFeatureCard} ${styles.gridItem}`}>
                        <a>User Profile</a>
                        <p>Mange your profile, accounting, and aesthetics.</p>
                    </div>
                    <div className={`${styles.simpleFeatureCard} ${styles.gridItem}`}>
                        <a>Dashboard</a>
                        <p>View your event analytics and manage your event.</p>
                    </div>
                </Masonry>


            </Box>
        )
    } else if (loading) {
        return (
            <div>
                <a id={"email-display"}>LOADING...</a>
            </div>
        )
    } else if (error) {
        return (
            <div>
                <a id={"email-display"}>AUTH ERROR</a>
            </div>
        )
    }

    return null
}

export default Dashboard

