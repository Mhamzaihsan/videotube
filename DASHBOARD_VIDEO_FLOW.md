# Dashboard Video Data Flow Documentation

## Overview

This document explains where the videos displayed on the dashboard come from in the VideoTube application.

## Important Note

**There is no `dashboard.html` file in this project.** The dashboard is implemented as a React component called `Admin.jsx` located at `/client/src/pages/Admin.jsx`.

## Complete Data Flow

### 1. Frontend Component: Admin.jsx

**Location:** `/client/src/pages/Admin.jsx`

The dashboard is rendered by the `Admin` React component which:

```javascript
// Lines 18-27: API call to fetch dashboard data
const { data, isLoading, isError } = useQuery({
  queryKey: ["dashboardData", username],
  queryFn: async () => {
    const response = await axiosInstance.get(
      `/users/c/${username}/dashboard`
    );
    return response.data?.data;
  },
  enabled: !!username,
});
```

**Video Display:** The videos are displayed in a table format (lines 224-296):

```javascript
// Lines 224-226: Mapping over videos from API response
{data?.totalVideos?.map((video) => (
  <tr key={video._id}>
    // Video details displayed here: title, views, createdAt, actions
  </tr>
))}
```

### 2. API Endpoint

**Route:** `GET /users/c/:username/dashboard`

**Location:** `/server/src/routes/user.routes.js` (line 53)

```javascript
router.route("/c/:username/dashboard").get(verifyJWT, getDashboardData);
```

### 3. Backend Controller: getDashboardData

**Location:** `/server/src/controllers/user.controller.js` (lines 555-657)

**Key Video Query:**

```javascript
// Lines 609-611: Fetch all videos owned by the user
const totalVideos = await Video.find({ owner: user._id }).select(
  "-password -refreshToken"
);
```

**Data Structure Returned:**

```javascript
// Lines 645-656: API response structure
return res.status(200).json(
  new ApiResponse(
    200,
    {
      totalViews: totalViews[0]?.totalViews || 0,
      totalSubscribers: subscribers[0]?.subscribersCount || 0,
      totalVideos: totalVideos || 0,  // ← Videos array here
      totalLikes: totalLikes[0]?.totalLikes || 0,
    },
    "Dashboard data fetched successfully"
  )
);
```

### 4. Database Model: Video

**Location:** `/server/src/models/video.model.js`

**Schema Structure:**

```javascript
const videoSchema = new Schema({
  videoFile: {
    url: String,        // Cloudinary URL
    publicId: String
  },
  thumbnail: {
    url: String,        // Cloudinary URL
    publicId: String
  },
  title: String,
  description: String,
  duration: Number,     // From Cloudinary
  views: Number,
  isPublished: Boolean,
  owner: ObjectId       // ← Key field for filtering user's videos
}, { timestamps: true });
```

## Video Data Source Summary

1. **Database Source:** Videos are stored in MongoDB using the `Video` model
2. **Filtering:** Only videos where `owner` field matches the authenticated user's ID
3. **Query:** Simple `Video.find({ owner: user._id })` query
4. **Authentication:** User must be authenticated (verifyJWT middleware)
5. **Authorization:** User can only view their own dashboard data

## Video Properties Displayed

The dashboard shows the following video information:

- **Status:** Always shows "Published" (hardcoded in frontend)
- **Title:** `video.title`
- **Views:** `video.views`
- **Upload Date:** `video.createdAt` (formatted with timeAgoFormat utility)
- **Actions:** Edit and Delete buttons

## Security

- **Authentication Required:** `verifyJWT` middleware ensures user is logged in
- **Authorization Check:** Controller verifies `user._id === req.user._id` to prevent unauthorized access
- **User Isolation:** Each user can only see their own videos

## File Locations Reference

- **Frontend Component:** `/client/src/pages/Admin.jsx`
- **API Route:** `/server/src/routes/user.routes.js`
- **Controller:** `/server/src/controllers/user.controller.js`
- **Database Model:** `/server/src/models/video.model.js`