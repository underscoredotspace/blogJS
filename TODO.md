## Client
- [ ] Get route set up with related controler rather than in config
- [ ] Make client tests slightly less mental
- [ ] Nice error messages

# New Posts/Admin
- [ ] Autosave drafts to local storage
  - Amend routes to '/edit/new' and '/edit/draft/:id'?
- [ ] Manual save of drafts to DB
- [ ] Emoji picker
- [ ] Image/other assets storage/picker

# Pie in the Sky
- Templating so others can use this as a framework
- Deployment upon successful tests
- Caching
- Better, more complete Docker setup

# New/Edit Post
- Routes:
  - /new
  - /edit/[postID|nuuID]
- Automatically saves draft into localStorage
- Has Submit Post button that sends to database with {visible:true}
- Has Save Draft button that sends to database with {visible:false}
- Both buttons clear localStorage record