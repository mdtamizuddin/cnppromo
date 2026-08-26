import { Button } from '@material-tailwind/react';
import { Card } from '@material-tailwind/react';
import React from 'react';
import { useSelector } from 'react-redux';
import { api } from '../../../util/axios';
import toast from 'react-hot-toast';
import UpdateDialog from './UpdateDialog';
import { Modal } from 'antd';
import WorkDetails from './WorkDetails';
import LinkifyText from '../../../util/linkify';
import ReactPlayer from 'react-player';



const WorkCard = ({ data, refetch }) => {
    const { user } = useSelector(state => state.user)
    const deleteWork = async () => {
        try {
            const confirm = window.confirm("Are you sure you want to delete this work?")
            if (!confirm) {
                return
            }
            const res = await api.delete(`/work/${data?._id}`)
            toast.success("Work Delete Successfull")
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Something went wrong")
        }
    }
    const [open, setOpen] = React.useState(false);
    const [show, setShow] = React.useState(false);
    return (
        <Card className='p-5  w-full'>
            <Modal open={show} onOk={() => setShow(false)} onCancel={() => setShow(false)} footer={null} title="Work Details" loading={!data}
                centered
            >
                <WorkDetails data={data} />
            </Modal>
            <UpdateDialog open={open} setOpen={setOpen} data={data} refetch={refetch} />
            
            <ReactPlayer url={data?.link} width={300} height={200}  style={{
                borderRadius: "5px",
                marginTop: "10px",
            }} />
            <h1 className='mt-3' >
                <LinkifyText text={data?.name} />
            </h1>
            <div className='mt-3 text-sm mb-2 h-16'>
                <LinkifyText text={data?.desc?.slice(0, 150) } />
                {data?.desc?.length > 150 && <span>......</span>}
            </div>
            {
                user?.role === "admin" ? <div className='mt-3 flex items-center gap-3'>
                    <Button onClick={() => setOpen(true)} size='sm' variant='filled' color='green'>
                        Update Work
                    </Button>
                    <Button onClick={deleteWork} size='sm' variant='filled' color='red'>
                        Delete Work
                    </Button>
                    <Button onClick={() => setShow(true)} size='sm' variant='filled' color='green'>
                        View Work
                    </Button>
                </div>
                    :
                    <Button onClick={() => setShow(true)} size='sm' variant='filled' color='green'>
                        View Work
                    </Button>
            }
        </Card>
    );
};

export default WorkCard;