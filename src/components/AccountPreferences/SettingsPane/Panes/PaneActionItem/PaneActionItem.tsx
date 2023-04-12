import paneActionStyles from './PaneActionItem.module.scss';
import {Grid} from "@mui/material";
import {EditButton} from "../../Utils/EditButton/EditButton";
import React, {useEffect} from "react";
import {bool} from "yup";


export function PaneActionItem(props: any) {
    const [editMode, setEditMode] = React.useState(false);

    const childrenWithProps = React.Children.map(props.children, (child) => {
        // checking isValidElement is the safe way and avoids a typescript error too
        if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
                editMode: editMode });
        }
        return child;
    });


    return (
        <div className={`${paneActionStyles.actionItemContainer}`}>
            <h4 className={paneActionStyles.actionItemTitle}>{props.title}</h4>
            <div className={`${editMode ? paneActionStyles.actionItemContainerEditable : paneActionStyles.actionItemContainerNonEditable}`}>
                {childrenWithProps}
            </div>


            <EditButton setEditMode={setEditMode}  editMode={editMode}/>
        </div>
    )

}

export default PaneActionItem;