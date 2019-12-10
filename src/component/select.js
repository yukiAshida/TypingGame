import React, {Component} from 'react';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import OutlinedInput from '@material-ui/core/OutlinedInput';

const SelectComponent = (props)=>{

    return (
        <FormControl style={{minWidth: 200}}>
            <InputLabel htmlFor={props.id}>{props.label}</InputLabel>
            <Select
                value={props.value}
                onChange={props.change}

                inputProps={{
                    name: props.label,
                    id: props.id
                }}
            >
                {props.items.map( (item_name) => <MenuItem value={item_name} key>{item_name}</MenuItem> )}
            </Select>
        </FormControl>
    );
}

export default SelectComponent; 