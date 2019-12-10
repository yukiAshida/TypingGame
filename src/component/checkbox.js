import React, {Component} from "react";
import ReactDOM from "react-dom";
import Checkbox from '@material-ui/core/Checkbox';

const CheckboxComponent = (props)=>{
    return (
        <Checkbox
            checked={props.checked}
            onChange={props.onChange}
            color="primary"
        />
    );
}

export default CheckboxComponent;