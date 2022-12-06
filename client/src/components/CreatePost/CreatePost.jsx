import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Modal } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import useStyles from './styles';
import { createPost, updatePost } from '../../actions/posts';
import { updateCategory } from '../../actions/category.js';
import { parseUsernameInitials } from '../../utility/index.js';
import { toast } from 'react-toastify';
import PostEditor from './PostEditor.jsx';
import './styles.css';

const CreatePost = ({
  currentId,
  setCurrentId,
  toastID,
  file,
  setFile,
  modal,
  setModal,
}) => {
  const post = useSelector((state) =>
    currentId ? state.posts.find((p) => p._id === currentId) : null
  );
  const classes = useStyles();
  const dispatch = useDispatch();

  const [postData, setPostData] = useState({
    title: '',
    message: '',
    tags: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (post) {
      setPostData(post);
      setModal(true);
    }
  }, [post, setModal]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (postData.title === '') {
      setError('Title cannot be empty');
      return;
    } else if (postData.message === '') {
      setError('Message cannot be empty');
      return;
    }

    toast.dismiss(toastID.current);
    toastID.current = toast.loading(
      `${currentId ? 'Updating' : 'Creating'} your post`
    );
    if (currentId) {
      dispatch(updatePost(currentId, postData, file)).then((message) => {
        toast.update(toastID.current, {
          render: `${
            message === 'ok'
              ? 'Post successfully updated'
              : 'Could not update your post'
          }`,
          type: `${message === 'ok' ? 'success' : 'error'}`,
          hideProgressBar: true,
          isLoading: false,
          autoClose: 3000,
        });
      });
    } else {
      dispatch(createPost(postData, file)).then((message) => {
        toast.update(toastID.current, {
          render: `${
            message === 'ok'
              ? 'Post successfully created'
              : 'Could not create your post'
          }`,
          type: `${message === 'ok' ? 'success' : 'error'}`,
          hideProgressBar: true,
          isLoading: false,
          autoClose: 3000,
        });
      });
    }

    handleModal();
  };

  const handleModal = () => {
    setModal((prev) => !prev);
    clear();
  };

  const handleImageUpload = (e) => {
    setFile(e.target.files[0]);
  };

  const clear = () => {
    setCurrentId(null);
    setPostData({
      title: '',
      message: '',
      tags: '',
    });
    dispatch(updateCategory(''));
    setFile(null);
  };

  return (
    <div className="create-post d-flex justify-content-between p-3 my-2">
      <Avatar className={classes.avatar}>{parseUsernameInitials()}</Avatar>
      <div
        className="create-post-button d-flex justify-content-center align-items-center p-1"
        onClick={handleModal}
      >
        Want to share a Snap?
      </div>
      <Modal
        open={modal}
        className={classes.modal}
        onClose={handleModal}
        aria-labelledby="modal"
        aria-describedby="modal"
      >
        <div className="form-container p-3 p-md-5">
          <h4 className="form-header text-center fw-bolder header-modal-form">
            {currentId ? 'Edit' : 'Add A'} SNAP
          </h4>
          <button
            className="form-header-close btn m-1 m-md-3"
            type="button"
            onClick={handleModal}
          >
            <CloseIcon fontSize="small" />
          </button>

          <div className="input-group input-group-lg my-3">
            <input
              type="text"
              className="form-control"
              aria-label="post title"
              aria-describedby="post title"
              placeholder="Title"
              value={postData.title}
              onChange={(e) =>
                setPostData({ ...postData, title: e.target.value })
              }
            />
          </div>

          <PostEditor postData={postData} setPostData={setPostData} />

          <div className="input-group input-group-lg my-3">
            <span className="input-group-text">@</span>
            <input
              type="text"
              className="form-control"
              placeholder="comma separated tags"
              aria-label="tags"
              aria-describedby="tags"
              value={postData.tags}
              onChange={(e) =>
                setPostData({ ...postData, tags: e.target.value })
              }
            />
          </div>

          <input
            style={{ width: '100%' }}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />
          {file && (
            <div className="post-photo-container">
              <img
                className="user-photo"
                src={file ? URL.createObjectURL(file) : null}
                alt="snap uploaded by user"
              />
            </div>
          )}

          <div className="form-actions d-flex justify-content-end pt-3">
            <span className="text-danger me-3 d-flex align-items-center">
              {error}
            </span>
            <button
              className="btn me-2 btn-outline-primary"
              type="button"
              onClick={handleModal}
            >
              Clear & Close
            </button>
            <button
              className="btn btn-outline-success"
              type="button"
              onClick={handleSubmit}
            >
              {currentId ? 'Save' : 'Add'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CreatePost;
