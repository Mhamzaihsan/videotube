# Dashboard Video Data Flow - Visual Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           VIDEO DATA FLOW ON DASHBOARD                  │
└─────────────────────────────────────────────────────────────────────────┘

1. USER ACCESS
   └── User logs in and navigates to dashboard (Admin.jsx component)

2. FRONTEND (React/Client)
   ┌─────────────────────────────────────────────────────────────────────┐
   │ Admin.jsx Component                                                 │
   │ Location: /client/src/pages/Admin.jsx                              │
   │                                                                     │
   │ useQuery() → HTTP GET Request                                       │
   │ URL: /users/c/${username}/dashboard                                 │
   │ Method: GET                                                         │
   │ Headers: Authorization: Bearer <token>                              │
   └─────────────────────────────────┬───────────────────────────────────┘
                                    │
                                    │ HTTP Request
                                    ▼
3. BACKEND (Express/Node.js)
   ┌─────────────────────────────────────────────────────────────────────┐
   │ Route: /users/c/:username/dashboard                                 │
   │ Location: /server/src/routes/user.routes.js                        │
   │                                                                     │
   │ Middleware: verifyJWT (authentication check)                       │
   │ Controller: getDashboardData()                                      │
   └─────────────────────────────────┬───────────────────────────────────┘
                                    │
                                    │ Function Call
                                    ▼
   ┌─────────────────────────────────────────────────────────────────────┐
   │ getDashboardData() Controller                                       │
   │ Location: /server/src/controllers/user.controller.js               │
   │                                                                     │
   │ Security Checks:                                                    │
   │ ✓ User exists in database                                           │
   │ ✓ Authenticated user matches username                               │
   │                                                                     │
   │ Database Queries:                                                   │
   │ → totalViews: Video.aggregate([{$match: {owner: user._id}}...])     │
   │ → totalLikes: Like.aggregate([...])                                 │
   │ → totalVideos: Video.find({ owner: user._id })  ← VIDEOS SOURCE    │
   │ → subscribers: User.aggregate([...])                                │
   └─────────────────────────────────┬───────────────────────────────────┘
                                    │
                                    │ MongoDB Query
                                    ▼
4. DATABASE (MongoDB)
   ┌─────────────────────────────────────────────────────────────────────┐
   │ Video Collection                                                    │
   │ Location: MongoDB Database                                          │
   │ Model: /server/src/models/video.model.js                           │
   │                                                                     │
   │ Query: db.videos.find({ owner: ObjectId("user_id") })              │
   │                                                                     │
   │ Document Structure:                                                 │
   │ {                                                                   │
   │   _id: ObjectId,                                                    │
   │   title: String,                 ← Displayed on dashboard           │
   │   description: String,                                              │
   │   views: Number,                 ← Displayed on dashboard           │
   │   duration: Number,                                                 │
   │   owner: ObjectId,               ← Used for filtering               │
   │   videoFile: { url, publicId },                                     │
   │   thumbnail: { url, publicId },                                     │
   │   isPublished: Boolean,                                             │
   │   createdAt: Date,               ← Displayed on dashboard           │
   │   updatedAt: Date                                                   │
   │ }                                                                   │
   └─────────────────────────────────┬───────────────────────────────────┘
                                    │
                                    │ Query Results
                                    ▼
5. RESPONSE FLOW
   ┌─────────────────────────────────────────────────────────────────────┐
   │ API Response                                                        │
   │                                                                     │
   │ {                                                                   │
   │   success: true,                                                    │
   │   data: {                                                           │
   │     totalViews: 1250,                                               │
   │     totalSubscribers: 45,                                           │
   │     totalVideos: [                ← Array of user's videos         │
   │       {                                                             │
   │         _id: "video1_id",                                           │
   │         title: "My Video Title",                                    │
   │         views: 150,                                                 │
   │         createdAt: "2024-01-15T...",                                │
   │         ...                                                         │
   │       },                                                            │
   │       { ... more videos ... }                                       │
   │     ],                                                              │
   │     totalLikes: 89                                                  │
   │   }                                                                 │
   │ }                                                                   │
   └─────────────────────────────────┬───────────────────────────────────┘
                                    │
                                    │ HTTP Response
                                    ▼
6. FRONTEND DISPLAY
   ┌─────────────────────────────────────────────────────────────────────┐
   │ Admin.jsx - Video Table Rendering                                   │
   │                                                                     │
   │ {data?.totalVideos?.map((video) => (                               │
   │   <tr key={video._id}>                                              │
   │     <td>Published</td>                                              │
   │     <td>{video.title}</td>                                          │
   │     <td>{video.views} views</td>                                    │
   │     <td>{timeAgoFormat(video.createdAt)}</td>                       │
   │     <td>                                                            │
   │       <button onClick={() => handleEdit(video._id)}>Edit</button>   │
   │       <button onClick={() => handleDelete(video._id)}>Delete</button│
   │     </td>                                                           │
   │   </tr>                                                             │
   │ ))}                                                                 │
   └─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                                SUMMARY                                   │
│                                                                         │
│ The videos on the dashboard come from:                                 │
│ 1. MongoDB Video collection                                             │
│ 2. Filtered by owner field matching authenticated user                 │
│ 3. Retrieved via REST API endpoint /users/c/:username/dashboard        │
│ 4. Displayed in Admin.jsx React component                              │
│                                                                         │
│ Key Files:                                                              │
│ • Frontend: /client/src/pages/Admin.jsx                                │
│ • Route: /server/src/routes/user.routes.js                             │
│ • Controller: /server/src/controllers/user.controller.js               │
│ • Model: /server/src/models/video.model.js                             │
└─────────────────────────────────────────────────────────────────────────┘
```