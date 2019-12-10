import React, {Component} from "react";
import ReactDOM from "react-dom";
import TextField from '@material-ui/core/TextField';

export const TextComponent = (props)=>{

    return (
        <TextField
            label = {props.label}
            value={props.value}
            onChange={props.onChange}
            margin="normal"
            variant="outlined"
            autoComplete = "off"
            fullWidth
        />
    );
}

export const TextComponentReadOnly = (props)=>{

    return (
        <TextField
            label = {props.label}
            value={props.value}
            margin="normal"
            variant="outlined"
            autoComplete = "off"
            fullWidth
            InputProps={{
                readOnly: true,
            }}
        />
    );
}

//export default {"TextComponent":TextComponent,"TextComponentReadOnly":TextComponentReadOnly};