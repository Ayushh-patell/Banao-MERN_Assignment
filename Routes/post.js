const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const getuser = require("../userMiddleWare");
const User = require("../Models/User");

//(Route:1) Create a post
router.post("/CreatePost", getuser, async (req, res) => {
  const id = req.userId;
  try {
    let { imgurl, caption } = req.body;
    const user = await User.findById(id);
    if (!user) {
      res
        .status(400)
        .send({ success: false, errors: ["Problem in fetching the user"] });
    }
    let post = {
        imgURL: imgurl,
        caption: caption,
        likes: [],
        userID:user.id,
        comments:[]
    }
    user.post.push(post)
    await user.save()
    res.send({success:true, msg:"Post Created Successfully!"})
   
  } catch (error) {
    res.status(500).send({success:false, errors:["Internal Server Error"]});
  }
});

//(Route:2) get all posts
router.post("/Posts", getuser, async (req, res) => {
  const id = req.userId;
  try {
    const users = await User.find({}, 'post'); // Retrieve only the 'posts' field
    const allPosts = users.flatMap(user => user.post);
    res.json({success:true, allPosts});
} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
}
});

//(Route:3) update a post
router.post("/UpdatePost", getuser, async (req, res) => {
  const id = req.userId;
  const {imgurl, caption, PostID} = req.body;
  if(!PostID){
    res.status(400).send({success:false, errors:["Cannot update without Post-id"]})
}
  try {
    const user = await User.findById(id)// Retrieve only the 'posts' field
    if(!user){
        res.status(400).send({success:false, errors:["User not found or You are not the User"]})
    }
    const post = user.post.id(PostID);

    if (!post) {
        return res.status(404).json({success:false, errors: ['Post not found'] });
    }

    post.imgURL = imgurl
    post.caption = caption
    
    await user.save();
    res.send({success:true, user})

} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
}
});

//(Route:4) delete a post
router.delete('/users/delete',getuser, async (req, res) => {
    const id = req.userId;
    const { PostID } = req.body;

    if(!PostID){
        res.status(400).send({success:false, errors:["Cannot delete without Post-id"]})
    }
    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({success:false, errors: ['User not found or You are not the User']});
        }

        const post = user.post.id(PostID);

        if (!post) {
            return res.status(404).json({success:false, errors: ['Post not found'] });
        }
        post.deleteOne()
        await user.save();
        res.json({success:true, post:user.post});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

//(Route:5) like a post
router.put('/users/like',getuser, async (req, res) => {
    const Username = req.Username;
    const { UserID, PostID } = req.body;

    if(!PostID){
        res.status(400).send({success:false, errors:["Cannot like without Post-id"]})
    }
    try {
        const user = await User.findById(UserID);

        if (!user) {
            return res.status(404).json({success:false, errors: ['User not found']});
        }

        const post = user.post.id(PostID);

        if (!post) {
            return res.status(404).json({success:false, errors: ['Post not found'] });
        }
        post.likes.push(Username);
        await user.save();
        res.json({success:true, post:user.post});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
//(Route:5.2) unlike a post
router.delete('/users/like',getuser, async (req, res) => {
    const Username = req.Username;
    const { UserID, PostID } = req.body;

    if(!PostID){
        res.status(400).send({success:false, errors:["Cannot like without Post-id"]})
    }
    try {
        const user = await User.findById(UserID);

        if (!user) {
            return res.status(404).json({success:false, errors: ['User not found']});
        }

        const post = user.post.id(PostID);

        if (!post) {
            return res.status(404).json({success:false, errors: ['Post not found'] });
        }
        let index = post.likes.indexOf(Username)
        post.likes.splice(index, 1)
        await user.save();
        res.json({success:true, post:user.post});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

//(Route:6) comment a post
router.put('/users/comment',getuser, async (req, res) => {
    const Username = req.Username;
    const {UserID, cmt, PostID } = req.body;

    if(!PostID){
        res.status(400).send({success:false, errors:["Cannot comment without Post-id"]})
    }
    try {
        const user = await User.findById(UserID);

        if (!user) {
            return res.status(404).json({success:false, errors: ['User not found']});
        }

        const post = user.post.id(PostID);

        if (!post) {
            return res.status(404).json({success:false, errors: ['Post not found'] });
        }
        comment = {
            CMTUser:Username,
            CMT:cmt
        }
        post.comments.push(comment)
        await user.save();
        res.json({success:true, post:user.post});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


//(Route:7) update a comment
router.put('/users/comments/update', async (req, res) => {
    const { UserID, PostID, CMTID, CMT } = req.body;

    if(!PostID||!UserID||!CMTID){
        res.status(400).send({success:false, errors:["Cannot change comment without id"]})
    }
    try {
        const user = await User.findById(UserID);

        if (!user) {
            return res.status(404).json({success:false, errors: ['User not found']});
        }

        const post = user.post.id(PostID);

        if (!post) {
            return res.status(404).json({success:false, errors: ['Post not found']});
        }

        const comment = post.comments.id(CMTID);

        if (!comment) {
            return res.status(404).json({success:false, errors: ['Comment not found']});
        }
        comment.CMT = CMT;

        await user.save();
        return res.json({success:true, post:user.post});
    } catch (error) {
        console.error(error);
        return res.status(404).json({success:false, errors: ['Internal Server Error']});
    }
});

//(Route:8) delete a comment
router.delete('/users/comments/delete', async (req, res) => {
    const { UserID, PostID, CMTID } = req.body;

    if(!PostID||!UserID||!CMTID){
        res.status(400).send({success:false, errors:["Cannot change comment without id"]})
    }
    try {
        const user = await User.findById(UserID);

        if (!user) {
            return res.status(404).json({success:false, errors: ['User not found']});
        }

        const post = user.post.id(PostID);

        if (!post) {
            return res.status(404).json({success:false, errors: ['Post not found']});
        }

        const comment = post.comments.id(CMTID);

        if (!comment) {
            return res.status(404).json({success:false, errors: ['Comment not found']});
        }
        comment.deleteOne()

        await user.save();
        return res.json({success:true, post:user.post});
    } catch (error) {
        console.error(error);
        return res.status(404).json({success:false, errors: ['Internal Server Error']});
    }
});

module.exports = router;
