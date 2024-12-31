const { createHmac , randomBytes } = require("crypto");
const {Schema , model} = require('mongoose');
const { createTokenForUser } = require("../services/authentication");

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true
    }
    , email: {
        type: String,
        required: true,
        unique: true
    }
    , salt:{
        type:String,
    }, 
    password: {
        type: String,
        required: true
    },
    profileImageURL: {
        type: String,
        default: 'https://i.imgur.com/0UQXw.png'
    },
    role:{
        type:String,
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    }
},{timestamps: true}
);

userSchema.pre("save", function (next){
    const user =  this;
    if (!user.isModified("password")) return;

    const salt = randomBytes(16).toString();
    const hashedPassword = createHmac("sha256", salt)
    .update(user.password)
    .digest("hex");

    this.salt=salt;
    this.password=hashedPassword;
    next();
});

userSchema.static("matchPasswordAndGenerateToken", async function (email, password) {
    const user = await this.findOne({ email });
    
    if (!user) {
        console.log("User not found for email:", email);
        return null;  // Return null if user is not found
    }

    const hashedPassword = createHmac("sha256", user.salt)
        .update(password)
        .digest("hex");

    if (hashedPassword !== user.password) {
        console.log("Incorrect password for user:", email);
        return null;  // Return null if password does not match
    }

    // Generate and return token if password matches
    const token = createTokenForUser(user);
    return token;
});


const User = model('user',userSchema);
module.exports = User;