function authenticateUser(email, password) {
  for(const userId in users) {
    if(users[userId].password === password && users[userId].email === email){
      var user = users[userId];
    }
  }
return user;
}
