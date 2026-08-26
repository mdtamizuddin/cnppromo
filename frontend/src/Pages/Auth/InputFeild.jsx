import { Select } from '@material-tailwind/react';
import React from "react";
import { useCountries } from "use-react-countries";
import {
    Input,
    Menu,
    MenuHandler,
    MenuList,
    MenuItem,
    Button,
} from "@material-tailwind/react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-regular-svg-icons';

const InputFeild = ({ styles, variant, ...props }) => {
    const [showPassword, setShowPassword] = React.useState(false);
    return (
        <div className={`${styles} w-full`}>
            <Input {...props} variant={variant ? variant : "static"} icon={props.type === "password" ? <FontAwesomeIcon
                onClick={() => setShowPassword(!showPassword)}
                icon={faEye} /> : null}
                type={showPassword ? "text" : props.type}
            />
        </div>
    );
};

export const InputSelect = ({ variant, ...props }) => {
    return (
        <div>
            <Select {...props} variant={variant ? variant : "static"} />
        </div>
    );
};
export const PhoneNumber = ({ }) => {
    const { countries } = useCountries();
    const [country, setCountry] = React.useState(10);
    const { name, flags, countryCallingCode } = countries[countries.findIndex((c) => c.name === "Bangladesh")];

    return (
        <div className="relative flex w-full max-w-[24rem]">
            <Menu placement="bottom-start">
                <MenuHandler>
                    <Button
                        ripple={false}
                        variant="text"
                        color="blue-gray"
                        className="flex h-10 items-center gap-2 rounded-r-none border border-r-0 border-blue-gray-200 bg-blue-gray-500/10 pl-3"
                    >
                        <img
                            src={flags.svg}
                            alt={name}
                            className="h-4 w-4 rounded-full object-cover"
                        />
                        {countryCallingCode}
                    </Button>
                </MenuHandler>
                <MenuList className="max-h-[20rem] max-w-[18rem]">
                    {countries.sort((a, b) => a.name.localeCompare(b.name)).map(({ name, flags, countryCallingCode }, index) => {
                        return (
                            <MenuItem
                                key={name}
                                value={name}
                                className="flex items-center gap-2"
                                onClick={() => setCountry(index)}
                            >
                                <img
                                    src={flags.svg}
                                    alt={name}
                                    className="h-5 w-5 rounded-full object-cover"
                                />
                                {name} <span className="ml-auto">{countryCallingCode}</span>
                            </MenuItem>
                        );
                    })}
                </MenuList>
            </Menu>
            <Input
                type="number"
                placeholder="Mobile Number"
                className="rounded-l-none !border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                    className: "before:content-none after:content-none",
                }}
                containerProps={{
                    className: "min-w-0",
                }}

                name='phone'
            />
        </div>
    );
}
export default InputFeild;