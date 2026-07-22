const { spawn } = require('child_process');

module.exports = {
  bin: 'cloudflared', 
  
  
  binPath: 'cloudflared',
  
  run: function(args) {
    return spawn('cloudflared', args, { stdio: 'inherit' });
  }
};

