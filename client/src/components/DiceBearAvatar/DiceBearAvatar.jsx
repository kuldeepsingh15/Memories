import React, { memo } from 'react';
import { createAvatar } from '@dicebear/avatars';
import * as style from '@dicebear/avatars-avataaars-sprites';

const DiceBearAvatar = memo(({ username }) => {
  const avatar = createAvatar(style, {
    dataUri: true,
    seed: username,
  });

  return (
    <img src={avatar} className="card-img-top user-image" alt="user profile" />
  );
});

export default DiceBearAvatar;
