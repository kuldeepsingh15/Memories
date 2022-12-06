import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Skeleton from '@material-ui/lab/Skeleton';
import SkeletonSpecificPost from './SkeletonSpecificPost';
import { isValidImageURL, options } from '../../utility/index.js';
import NavBar from '../NavBar/NavBar.jsx';

const ViewPost = () => {
  const params = useParams();
  const post = useSelector(
    (state) => state.posts.filter((post) => post._id === params.id)[0]
  );

  return (
    <div
      className="container-fluid bg-white p-0"
      style={{ backgroundColor: '#f1f1f1' }}
    >
      <NavBar disableSearch={true} />
      <nav
        aria-label="breadcrumb"
        className="p-3 d-flex justify-content-between"
      >
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/" className="text-primary">
              Home
            </Link>
          </li>
          <li className="breadcrumb-item"> View Post </li>
        </ol>
      </nav>

      {!post || !post._id ? (
        <SkeletonSpecificPost />
      ) : (
        <div className="px-3">
          <div className="d-flex flex-column align-items-center">
            <h2 className="fs-1 fw-bolder fst-italic text-primary">
              {post.title}
            </h2>
            <p className="fw-light">
              {new Date(post.createdAt).toLocaleString('en-US', options)}
            </p>
          </div>
          <h4 className="text-end pe-3 fst-italic text-primary mb-3">
            - {post.creator}
          </h4>

          <div className="row">
            <div className="col-12 col-md-5 px-2">
              <div className="card border-0">
                {!isValidImageURL(post.selectedFile.url) ? (
                  <Skeleton variant="rect" height={300} />
                ) : (
                  <img
                    alt="Post"
                    src={post.selectedFile.url}
                    className="card-img-top"
                  />
                )}
              </div>
            </div>
            <div className="col-12 col-md-7 px-2">
              <div className="card border-0">
                <div className="card-body">
                  <p
                    className="card-text fs-5"
                    dangerouslySetInnerHTML={{ __html: post.message }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex flex-column align-items-center p-5">
            <button
              type="button"
              className="btn btn-primary btn-lg position-relative"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasWithBothOptions"
              aria-controls="offcanvasWithBothOptions"
            >
              Likes
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {post.likedBy.length}
                <span className="visually-hidden">Likes on Post</span>
              </span>
            </button>
          </div>

          <div
            className="offcanvas offcanvas-start"
            data-bs-scroll="true"
            tabIndex="-1"
            id="offcanvasWithBothOptions"
            aria-labelledby="offcanvasWithBothOptionsLabel"
          >
            <div className="offcanvas-header">
              <h5
                className="offcanvas-title fw-bolder fst-italic text-primary"
                id="offcanvasWithBothOptionsLabel"
              >
                Users who liked your Post
              </h5>
              <button
                type="button"
                className="btn-close text-reset"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              ></button>
            </div>
            <div className="offcanvas-body">
              <ul className="list-group list-group-flush">
                {post.likedBy.map((user) => (
                  <li
                    className="list-group-item list-group-item-action"
                    key={user}
                  >
                    {user}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewPost;
