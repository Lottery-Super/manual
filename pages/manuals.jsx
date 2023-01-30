import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import useSWR, { useSWRConfig } from 'swr';
import { Button, Card, Input, Textarea, Link, Spacer, Modal, Loading } from '@geist-ui/core';
import Header from '../components/Header';
import useToken from '../components/Token';

export default function Manuals() {
  const user = useToken();
  const { mutate } = useSWRConfig();
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [field, setField] = useState({ title: '', description: '' });

  const getManuals = async (url) => {
    return await fetch(url, {
      headers: { 'content-type': 'application/json', apikey: process.env.NEXT_PUBLIC_API_KEY },
    }).then((res) => res.json());
  };

  const { data, error, isLoading } = useSWR('/api/manuals?page=1&limit=1000', getManuals);

  const toggleModal = () => {
    setModal(!modal);
  };

  const addManual = async (form) => {
    setLoading(true);
    const url = `/api/manuals/create`;
    await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', apikey: process.env.NEXT_PUBLIC_API_KEY },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setLoading(false);
          mutate('/api/manuals?page=1&limit=1000');
          toggleModal();
          toast.success('Manual created successfully');
        } else {
          toast.error(res.error);
          setLoading(false);
        }
      });
  };

  const save = async (e) => {
    let form = { ...field, user: user.id };
    await addManual(form);
  };

  const manual = data?.data.map((item, key) => (
    <div key={key}>
      <Card shadow hoverable>
        <div className="org-cards">
          <h3>{item.title}</h3>
          <Spacer h={3} />
          <div style={{ height: 50 }}>{item.description}</div>
          <Spacer />

          <Link className="custom-btn" href={`/m/${item.slug}`}>
            View &rarr;
          </Link>
        </div>
      </Card>
    </div>
  ));
  return (
    <div className="show-fake-browser navbar-page">
      <Toaster />
      <Modal visible={modal} onClose={toggleModal} disableBackdropClick>
        <Modal.Title>Create new manual</Modal.Title>
        <Modal.Content>
          <Input
            width="100%"
            htmlType="text"
            placeholder="Manual Title"
            onChange={(e) => setField({ ...field, title: e.target.value })}
          />
          <Spacer />
          <Textarea
            width="100%"
            rows={5}
            componentClass="textarea"
            placeholder="Manual Description"
            onChange={(e) => setField({ ...field, description: e.target.value })}
          />
        </Modal.Content>
        <Modal.Action passive onClick={toggleModal}>
          Cancel
        </Modal.Action>
        <Modal.Action
          type="secondary-light"
          loading={loading}
          onClick={save}
          disabled={!field?.title && !field?.description}
        >
          Save
        </Modal.Action>
      </Modal>

      <div className="container">
        <Header title="Manual" />

        <Spacer h={5} />
        <h3>
          Manuals &nbsp;&nbsp; &nbsp;
          {user.role !== 'reader' ? (
            <Button auto type="abort" onClick={toggleModal}>
              + New
            </Button>
          ) : (
            ''
          )}
        </h3>
        <br />
        <br />
        <center style={{ display: isLoading ? 'block' : 'none' }}>
          <Loading>Loading</Loading>
        </center>
        <div className="grid-3">{manual}</div>
        <Spacer h={10} />
      </div>
    </div>
  );
}
