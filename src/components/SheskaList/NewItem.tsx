import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Editor, Extension } from '@tiptap/core';
import { Color } from "@tiptap/extension-color";
import Document from '@tiptap/extension-document';
import ListItem from '@tiptap/extension-list-item';
import Paragraph from '@tiptap/extension-paragraph';
import { Placeholder } from "@tiptap/extension-placeholder";
import Text from '@tiptap/extension-text';
import TextStyle from '@tiptap/extension-text-style';
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { FilePondFile } from "filepond";
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import 'filepond/dist/filepond.min.css';
import { addDoc, collection, doc, DocumentReference, setDoc } from "firebase/firestore";
import { deleteObject, ref, uploadBytes } from "firebase/storage";
import { Formik, validateYupSchema, yupToFormErrors } from "formik";
import React, { ChangeEvent, MutableRefObject, useEffect, useRef, useState } from "react";
import { Carousel, ToastContainer } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Toast from "react-bootstrap/Toast";
import CurrencyInput from 'react-currency-input-field';
import { FilePond, registerPlugin } from 'react-filepond';
import { useAuthState } from "react-firebase-hooks/auth";
import { trackPromise, usePromiseTracker } from "react-promise-tracker";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import * as Yup from "yup";
import globalStyles from "../../App.module.css";
import { auth, db, storage } from "../../index";
import SheskaCardGuestView from "../GuestView/SheskaCardGuestView/SheskaCardGuestView";
import { DisplayFormikState } from "../Utils/DisplayFormikState";
import SheskaCard from "../Utils/SheskaCardDef";
import TipTapMenuBar from "./EditorUtil";
import imageManagerStyles from "./ImageManager/ImageManager.module.css";
import { default as ImageOrganizer } from "./ImageManager/ImageOrganizer";
import styles from "./NewItem.module.css";
import "./NewItemUtil.scss";
import SheskaCardDef from "../Utils/SheskaCardDef";

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview, FilePondPluginFileValidateType)

const area = 'newCard';
export function NewItem() {
    const [user] = useAuthState(auth);
    const [imagesToBeDeleted, setImagesToBeDeleted] = useState<string[]>([]);
    const [filePondLoading, setFilePondLoading] = useState<boolean>(true);
    const [submitDisabled, setSubmitDisabled] = useState<boolean>(false);
    const [imageOrder, setImageOrder] = useState<string[]>([]);
    const [images, setImages] = useState<{ [id: string]: string }>({});
    const [docRef, setDocRef] = useState<DocumentReference>();
    const [files, setFiles] = useState<FilePondFile[]>([]);
    const [filePondFileMapping, setFilePondFileMapping] = useState<{ [id: string]: string }>({});
    const [dataUploaded, setDataUploaded] = useState<boolean>(false);
    const { promiseInProgress } = usePromiseTracker({ area, delay: 0 });
    const navigate: NavigateFunction = useNavigate();
    let filePondRef: FilePond | null = null;
    const [previewCard, setPreviewCard] = useState<boolean>(false);

    const validationSchema = Yup.object({
        title: Yup.string().required('Title is required').max(50, 'Must be 50 characters or less'),
        subtitle: Yup.string().required('Subtitle is required').max(100, 'Must be 300 characters or less'),
        goal: Yup.number().typeError('Goal must be a number'),
        expectedAmount: Yup.number().test(
            'Expected amount must be less than goal',
            'Expected amount must be less than goal',
            (_value, { parent: formState }) => {
                console.log('running test', formState.goal, formState.expectedAmount);
                if(formState.goal && formState.expectedAmount){
                    return formState.expectedAmount < formState.goal;
                }
                return true;
            },
        ),
    });

    useEffect(() => {
        if (!user)
            return;
        const docRef = doc(collection(db, "users", user.uid, "sheska_list"));
        setDocRef(docRef);
    }, [user]);

    const prevImagesRef: MutableRefObject<null | { [id: string]: string }> = useRef(null);
    const prevImageOrderRef: MutableRefObject<null | string[]> = useRef(null);
    useEffect(() => {
        if (prevImagesRef.current === images && prevImageOrderRef.current === imageOrder)
            return;
        setImages((prevImages) => {
            console.log('FILES CHANGED, UPDATING IMAGES')
            files.forEach((file) => {
                console.log(file.file.name);
            })
            const newImages: { [id: string]: string } = {};
            const newImageOrder: string[] = [];
            const newFilePondFileMapping: { [id: string]: string } = {};

            if (prevImages) {
                imageOrder.forEach((id) => {
                    newImages[id] = prevImages[id];
                    newImageOrder.push(id);
                });
            }

            files.forEach((file) => {
                newFilePondFileMapping[file.filename] = file.id;

                if (images && !(file.filename in images)) {
                    newImages[file.filename] = URL.createObjectURL(file.file);
                    newImageOrder.push(file.filename);
                }
            })

            setImageOrder(newImageOrder);
            setFilePondFileMapping(newFilePondFileMapping);
            prevImagesRef.current = newImages;
            prevImageOrderRef.current = newImageOrder;
            return newImages;
        });
    }, [files, imageOrder, images])

    useEffect(() => {
        if (!dataUploaded)
            return;

        if(!filePondLoading || files.length === 0) {
            console.log('NAVIGATING BACK', dataUploaded, filePondLoading, files.length)
            navigate(-1);
        }

    }, [dataUploaded, filePondLoading, files, navigate]);

    const editor : any | null = useEditor({
        extensions: [
            Color.configure({ types: [TextStyle.name, ListItem.name] }),
            // @ts-ignore
            TextStyle.configure({ types: [ListItem.name] }),
            StarterKit.configure({
                bulletList: {
                },
                orderedList: {
                },
            }),
        ],
        content: `
<!--TODO use the custom documents system to make this into a placeholder text rather than REAL text like it is rn-->
              <h2>
                Hi there,
              </h2>
              <p>
                This is a WYSIWYG editor, meaning what you see is what you (and your guests) will get. Use this as your canvas
                to describe this item to your heart's content! You can add images, links, videos, bullet points, and beyond!
                With the power of WYSIWYG, you can create a beautiful and engaging description of your item.
              </p>
              <p>Double-click on any of the buttons above to apply styles to your text.</p>
            `,
    })

    const server = {
        revert: (uniqueFileId: string, load: any, error: any   ) => {
            // Should remove the earlier created temp file here
            // ...
            const fileRef = ref(storage, "users/"+ auth.currentUser?.uid + "/" + docRef?.id + "/" +uniqueFileId);
            deleteObject(fileRef).then(() => {
                console.log('file removed:' + uniqueFileId);
            }).catch((error: any) => {
                console.log(error);
            });

            // Can call the error method if something is wrong, should exit after


            // Should call the load method when done, no parameters required
            load();
        },
        process: (fieldName: any, file:any, metadata:any, load:any, error:any, progress:any, abort:any, transfer:any, options:any) => {
            const id = file.name;

            const fileRef = ref(storage, "users/"+ auth.currentUser?.uid + "/" + docRef?.id + "/" +file.name);

            uploadBytes(fileRef, file).then((snapshot: any) => {
                progress(true, 100, 100);
                load(id);

            });

            return {
                abort: () => {
                    // This function is entered if the user has tapped the cancel button
                    // TODO MAKE SURE TO IMPLEMENT THIS SO THAT THE FILE IS NOT UPLOADED ON FIREBASE, CURERENTLY THIS DOES NOTHING
                    const fileRef = ref(storage, "users/"+ auth.currentUser?.uid + "/" + docRef?.id + "/" +file.name);
                    deleteObject(fileRef).then(() => {
                        console.log('file removed:' + file.name);
                    }).catch((error: any) => {
                        console.log(error);
                    });
                    abort();
                }
            }
        }

    }
    useEffect(() => {
        console.log('imagesDel', imagesToBeDeleted);
        console.log('filePondFileMapping', filePondFileMapping);

        imagesToBeDeleted.forEach((imageId: string) => {
            if(filePondRef?.getFile(filePondFileMapping[imageId]) != null) {
                filePondRef?.removeFile(filePondFileMapping[imageId])
                setImagesToBeDeleted(imagesToBeDeleted.filter((id: string) => id !== imageId));
            }
        });
        console.log('FILE POND REF', filePondRef);
    }, [imagesToBeDeleted, setImagesToBeDeleted, filePondFileMapping, filePondRef])

    const uploadFiles = (values: any, { setErrors } : any) => {
        setSubmitDisabled(true);

        filePondRef?.processFiles();
        trackPromise(
            postNewSheskaCard(values, docRef, imageOrder, editor)
            .then(() => {setDataUploaded(true)})
        );
    };

    const validateForm = (values: any) => {
        try {
            validateYupSchema(values, validationSchema, true);
        } catch (err) {
            return yupToFormErrors(err);
        }
    }

    const processCurrencyForTesting = (value: string) => {
        if(value === ''){
            return ['0','0']
        } else {
            if(value.includes('.')){
                const split = value.split('.');
                return [split[0], split[1]]
            } else {
                return [value, '0']
            }
        }
    }

    return (
        <div className={styles.pageContainer} id={'pageContainerNewItem'}>
            <div className={styles.formContainer}>
                <h1 className={styles.title}>Create a Card</h1>
                <Formik
                    validate={validateForm}
                    initialValues={{
                        title: '',
                        subtitle: '',
                        goal: '',
                        expectedAmount: '',
                        guestsAbsorbFees: false,
                    }}
                    onSubmit={uploadFiles}
                >
                    {props => {
                        const {
                          handleSubmit,
                          handleChange,
                          handleBlur,
                          values,
                          touched,
                          dirty,
                          errors,
                      } = props;
                      return (
                        <Form onSubmit={(event) => {
                            event.preventDefault();
                            handleSubmit();
                        }}>

                            {previewCard && <div className={styles.previewCardContainer}>
                                <FontAwesomeIcon icon={faXmark} className={styles.previewCloseIcon} onClick={() => {setPreviewCard(false); console.log('setPreviewFalse')}}/>
                                <SheskaCardGuestView sheskaCardDef={new SheskaCardDef(docRef?.id ?? '', values.title, values.subtitle, editor.getHTML(), imageOrder,
                                    processCurrencyForTesting(values.expectedAmount), processCurrencyForTesting(values.goal), ['0', '00'])} cardImages={images}/>
                            </div>}

                            <Form.Group controlId={'titleForm'} className={"mb-3 w-75 mx-auto"}>
                                <label className={styles.sectionHeader} >Title</label>
                                <p className={` ${styles.sectionSubheader} text-muted`}>Add your card title. (required) </p>
                                <Form.Control
                                    type={"text"}
                                    name={"title"}
                                    value={values.title}
                                    placeholder={"Title"}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isValid={touched.title && !errors.title}
                                    isInvalid={!!errors.title}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.title}
                                </Form.Control.Feedback>
                                <Form.Control.Feedback>
                                    {errors.title}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group controlId={'subtitleForm'} className={"mb-3 w-75 mx-auto"}>
                                <label className={styles.sectionHeader} >Subtitle</label>
                                <p className={`${styles.sectionSubheader} text-muted`}>Add your subtitle, short but descriptive. (required)</p>

                                <Form.Control
                                    as={"textarea"}
                                    type={"text"}
                                    name={"subtitle"}
                                    value={values.subtitle}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder={"Subtitle"}
                                    isValid={touched.subtitle && !errors.subtitle}
                                    isInvalid={touched.subtitle && !!errors.subtitle}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.subtitle}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <label className={`${styles.sectionHeader} mb-3 w-100 mx-auto`}  >Manage Images</label>
                            <ImageOrganizer images={images} imageOrder={imageOrder} setImageOrder={setImageOrder} setImages={setImages} cardID={docRef?.id}
                                            setImagesToBeDeleted={setImagesToBeDeleted} imagesToBeDeleted={imagesToBeDeleted}/>

                            <Form.Group controlId={'imageForm'} className={"mb-5 w-75 mx-auto "}>
                                {/*s s*/}
                                <FilePond

                                    className={styles.filePond}
                                    instantUpload={false}
                                    allowMultiple={true}
                                    server={server}
                                    onprocessfilestart={() => {setFilePondLoading(true); setSubmitDisabled(true);
                                        console.log('STARTED PROCESSING FILEs')}}
                                    onprocessfiles={() => {setFilePondLoading(false); navigate('/sheskalist'); console.log('FINISHED PROCESSING FILEs')}}

                                    onremovefile={(error: any, file: FilePondFile) => {
                                        let newFiles: FilePondFile[] = [];
                                        setImages((prevImages) => {
                                            // console.log('FILES CHANGED, UPDATING IMAGES')

                                            const newImages: { [id: string]: string } = {};
                                            const newImageOrder: string[] = [];


                                            imageOrder.forEach((id) => {
                                                if (prevImages) {
                                                    if(id !== file.filenameWithoutExtension){

                                                        newImages[id] = prevImages[id];
                                                        newImageOrder.push(id);
                                                    }
                                                }
                                            })

                                            setImageOrder(newImageOrder);

                                            console.log("SIZE OF IMAGES " + images?.length);
                                            console.log("SIZE OF IMAGESORDER: " + imageOrder.length);
                                            return newImages;
                                        })

                                        files.forEach((fileItem) => {
                                            if (fileItem.filenameWithoutExtension !== file.filenameWithoutExtension) {
                                                newFiles.push(fileItem);
                                            }
                                        })

                                        setFiles(newFiles);

                                    }
                                    }

                                    onupdatefiles={(fileItems: FilePondFile[]) => {
                                        setFiles(fileItems);
                                    }}

                                    ref={ref => filePondRef = ref}
                                    fileRenameFunction={(file) => {
                                        return `${uuidv4()}${file.extension}`; }}

                                />
                            </Form.Group>

                            <div className={styles.textEditor}>
                                <TipTapMenuBar editor={editor}/>
                                {(editor)? <EditorContent editor={editor} /> : <div>Loading...</div>}
                            </div>
                            <div className={styles.cardEventSettingsContainer}>
                                <div className={styles.cardFinancials}>
                                    <h3 className={styles.sectionHeader}>Financials</h3>
                                    <label className={`${styles.sectionHeader} ${styles.financialHeader}`} >Goal</label>
                                    <p className={` ${styles.sectionSubheader} ${'text-muted'}`}>Specify your goal. Leave blank if you don't require a limit. ($USD)</p>
                                    <Form.Group>
                                        <CurrencyInput
                                            prefix={'$'}
                                            id="goal"
                                            name="goal"
                                            placeholder="∞"
                                            decimalsLimit={2}
                                            onValueChange={(value: any) => handleChange({target: {name: 'goal', value}})}
                                            className={"form-control w-75"}
                                        />
                                    </Form.Group>
                                    <label className={`${styles.sectionHeader} ${styles.financialHeader}`} >Expected Amount</label>
                                    <p className={` ${styles.sectionSubheader} ${'text-muted'}`}>Specify the average donation you expect. Should be less than goal. (optional) ($USD)</p>
                                    <Form.Group>
                                        <>
                                            <CurrencyInput
                                                prefix={'$'}
                                                id="expectedAmount"
                                                name="expectedAmount"
                                                placeholder="0.00"
                                                decimalsLimit={2}
                                                onValueChange={(value: any) => handleChange({target: {name: 'expectedAmount', value}})}
                                                className={"form-control w-75"}
                                            />
                                            <div className={"invalid-feedback d-block"}>{errors.expectedAmount}</div>
                                        </>
                                    </Form.Group>
                                    <label className={`${styles.sectionHeader} ${styles.financialHeader}`} >Linked Account</label>
                                    <p className={` ${styles.sectionSubheader} ${'text-muted'}`}>Specify which of your added accounts this card should funnel into. (placeholder)</p>
                                    <img src={require('../../images/Screenshot_20230304_094522.png')}/>
                                </div>
                                <div className={styles.cardEventSettings}>
                                    <h3 className={styles.sectionHeader}>Event Settings</h3>
                                    <div className={styles.itemSetting}>
                                        <div className={styles.itemSettingName}>
                                            <div className={styles.settingName}>Guests absorb fees</div>
                                            <div className={styles.settingSubtitle}>
                                                Service Fees total to roughly 7%' +
                                                ' including transaction fees by banks that are not in control of Sheska.' +
                                                'Guests can absorb this 7% frictionlessly.
                                                </div>
                                            <Form.Check defaultChecked={false} className="form-switch-lg" type="switch" id='guestsAbsorbFees' onChange={handleChange}/>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.submitButtonContainer}>
                                <Button type={'submit'}  disabled={!dirty || promiseInProgress || submitDisabled} variant="primary" id={"button-signup"} className={`${"d-block w-75 text-center"}
                                        ${styles.loginButton}`}> Submit</Button>
                                <Button type={'button'}  disabled={!dirty || promiseInProgress || submitDisabled} variant="secondary" id={"button-preview"} className={`${"d-block w-25 text-center"}
                                        ${styles.loginButton}`} onClick={() => {setPreviewCard(true); console.log('setpreviewtrue')}}> Preview</Button>
                            </div>
                            {/*<DisplayFormikState {...props} />*/}
                        </Form>
                    )}}
                </Formik>
            </div>
        </div>
    )
}

export default NewItem;

/**
 *
 * @param title the card's title
 * @param subtitle the subtitle data for card
 * @param goal goal amount for card, can be empty string will be converted to 0
 * @param expected expected amount for card, can be empty string will be converted to 0
 * @param docRef reference to the document being updated in firestore, this is passed in rather then generated
 * at call time because the document reference needs to be created at the parent level because the same ref should be
 * used in firestore and google cloud.
 * @param imageOrder order of images as they appear in the card
 * @param editor editor instance with user description code
 */
async function postNewSheskaCard(values: { title: string, subtitle: string, goal: string, expectedAmount: string, guestsAbsorbFees: boolean }, docRef: any, imageOrder: string[], editor: Editor | null) {
    console.log(values)
    try {
        let processedGoal: number[];
        if (values.goal === '') {
            processedGoal = [0,0]
        } else if(values.goal.includes('.')) {
            processedGoal = values.goal.split('.').map((value) => parseInt(value))
        } else {
            processedGoal = [parseInt(values.goal), 0]
        }
        let expectedAmount: number[];
        if (values.expectedAmount === '') {
            expectedAmount = [0,0]
        } else if (values.expectedAmount.includes('.')) {
            expectedAmount = values.expectedAmount.split('.').map((value) => parseInt(value))
        } else {
            expectedAmount = [parseInt(values.expectedAmount), 0]
        }

        await setDoc(docRef,
            {
                title: values.title,
                subtitle: values.subtitle,
                description: editor?.getHTML(),
                imageOrder,
                goal: processedGoal,
                expectedAverage: expectedAmount,
                amountRaised: [0,0], // TODO PLACEHOLDER
                guestsAbsorbFees: values.guestsAbsorbFees,
                dateCreated: new Date().toISOString(),
                dateUpdated: new Date().toISOString(),
            }
        ).then(() => {
            return Promise.resolve("success");
        });
    } catch (e) {
        console.log(e);
        return Promise.reject(`failure: ${e}`);
    }
}