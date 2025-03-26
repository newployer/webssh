document.addEventListener('DOMContentLoaded', function() {
  // 尝试从localStorage获取验证状态
  const isAuthenticated = localStorage.getItem('webssh_authenticated');
  if (isAuthenticated === 'true') {
    document.getElementById('password-overlay').style.display = 'none';
    document.querySelector('.form-container').style.display = 'block';
  }
  
  // 添加尝试次数计数器
  let attemptCount = 0;
  const MAX_ATTEMPTS = 5;
  
  // 按Enter键提交密码
  document.getElementById('access-password').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      validatePassword();
    }
  });
  
  document.getElementById('submit-password').addEventListener('click', validatePassword);
  
  function validatePassword() {
    const password = document.getElementById('access-password').value;
    
    // 检查尝试次数
    if (attemptCount >= MAX_ATTEMPTS) {
      document.getElementById('password-error').textContent = '尝试次数过多，请稍后再试';
      document.getElementById('password-error').style.display = 'block';
      document.getElementById('submit-password').disabled = true;
      document.getElementById('access-password').disabled = true;
      return;
    }
    
    // 从服务器获取密码验证
    fetch('static/.env')
      .then(response => response.text())
      .then(data => {
        // 解析.env文件内容
        const lines = data.split('\n');
        let correctPassword = '';
        
        for (const line of lines) {
          if (line.startsWith('ACCESS_PASSWORD=')) {
            correctPassword = line.substring('ACCESS_PASSWORD='.length).trim();
            break;
          }
        }
        
        if (password === correctPassword) {
          // 密码正确
          document.getElementById('password-overlay').style.display = 'none';
          document.querySelector('.form-container').style.display = 'block';
          localStorage.setItem('webssh_authenticated', 'true');
        } else {
          // 密码错误
          attemptCount++;
          const remainingAttempts = MAX_ATTEMPTS - attemptCount;
          document.getElementById('password-error').textContent = 
            `密码错误，请重试。剩余尝试次数: ${remainingAttempts}`;
          document.getElementById('password-error').style.display = 'block';
          
          if (remainingAttempts <= 0) {
            document.getElementById('password-error').textContent = '尝试次数过多，请稍后再试';
            document.getElementById('submit-password').disabled = true;
            document.getElementById('access-password').disabled = true;
          }
        }
      })
      .catch(error => {
        console.error('Error fetching password:', error);
        document.getElementById('password-error').textContent = '验证失败，请联系管理员';
        document.getElementById('password-error').style.display = 'block';
      });
  }
});
