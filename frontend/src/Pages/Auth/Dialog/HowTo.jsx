import React from 'react';
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
} from "@material-tailwind/react";
import { useSelector } from 'react-redux';
import ReactPlayer from 'react-player';
const HowTo = ({ open, setOpen }) => {
    const { settings } = useSelector(state => state.user)
    const handleOpen = () => setOpen(!open);
    return (
        <Dialog open={open} handler={handleOpen}>
            <DialogHeader>
                <h1 className='text-center '>
                    How to register in CNP Promo
                </h1>
            </DialogHeader>
            <DialogBody className='text-black'>
            <ReactPlayer url={settings?.ht_video} width={"100%"} style={{
                maxHeight: "350px"
            }} />
            </DialogBody>
            <DialogFooter>
                <Button variant="gradient" color="green" onClick={handleOpen}>
                    <span>Okay</span>
                </Button>
            </DialogFooter>
        </Dialog>
    );
};

export default HowTo;