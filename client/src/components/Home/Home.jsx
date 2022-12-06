import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Grid, Grow, Switch } from '@material-ui/core';
import CreatePost from '../CreatePost/CreatePost.jsx';
import NavBar from '../NavBar/NavBar.jsx';
import Posts from '../Posts/Posts.jsx';
import Category from '../Category/Category.jsx';
import CategoryPhotos from '../CategoryPhotos/CategoryPhotos.jsx';
import useStyles from './styles';
import './styles.css';
import { parseUsername } from '../../utility/index.js';
import { updateCategory } from '../../actions/category.js';
import { ToastContainer } from 'react-toastify';
import PhotoCarousel from './PhotoCarousel.jsx';

const Home = () => {
  const [currentId, setCurrentId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [switchState, setSwitchState] = useState(false);
  const [file, setFile] = useState(null);
  const [modal, setModal] = useState(false);

  const toastID = useRef(null);
  const classes = useStyles();
  const dispatch = useDispatch();

  const handleSwitchChange = (event) => {
    setSwitchState(event.target.checked);
  };

  const categoryTrend = useSelector(
    (state) => state.category.currentTrendSearch
  );
  const categoryPhotos = useSelector((state) => {
    if (categoryTrend === '' || !state.category.category[categoryTrend])
      return [];
    return state.category.category[categoryTrend];
  });

  return (
    <Container maxWidth="lg" className={classes.home}>
      <NavBar searchText={searchText} setSearchText={setSearchText} />
      <Grow in>
        <Grid
          className={classes.mainContainer}
          container
          justifyContent="space-between"
          alignItems="stretch"
        >
          <Grid
            item
            xs={12}
            sm={3}
            md={2}
            className={classes.categoryContainer}
          >
            <Category />
          </Grid>
          <Grid item xs={12} sm={5} md={6} className={classes.postContainer}>
            {categoryTrend.length === 0 ? (
              <Posts
                setCurrentId={setCurrentId}
                searchText={searchText}
                toastID={toastID}
                networkEnabled={switchState}
              />
            ) : (
              <CategoryPhotos
                photos={categoryPhotos}
                setFile={setFile}
                setModal={setModal}
              />
            )}
          </Grid>
          <Grid item xs={12} sm={4} className={classes.userContainer}>
            <h2 className="fw-bolder my-3 font-monospace welcome-name">
              Hi {parseUsername()}, &nbsp;
            </h2>

            <h5 className="fw-bolder my-3 font-monospace welcome-name text-center">
              Welcome to Memories
            </h5>

            <CreatePost
              currentId={currentId}
              setCurrentId={setCurrentId}
              file={file}
              setFile={setFile}
              modal={modal}
              setModal={setModal}
              toastID={toastID}
            />

            <div className="text-center mt-2">
              <h5 className="font-monospace pt-3">
                {categoryTrend.length === 0
                  ? 'Your Network Feed only?'
                  : 'View Your Feed'}
              </h5>
              <Switch
                checked={categoryTrend.length === 0 ? switchState : false}
                onChange={
                  categoryTrend.length === 0
                    ? handleSwitchChange
                    : () => dispatch(updateCategory(''))
                }
                color="primary"
                name="network-post"
                inputProps={{ 'aria-label': 'primary checkbox' }}
              />
            </div>
            <Grid item xs={12}>
              <PhotoCarousel />
            </Grid>
          </Grid>
        </Grid>
      </Grow>
      <ToastContainer />
    </Container>
  );
};

export default Home;
