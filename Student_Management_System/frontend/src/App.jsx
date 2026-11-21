import { useEffect, useState } from 'react'
import './style.css'

const API = 'http://localhost:8080/api/students'
const AUTH_API = 'http://localhost:8080/api/auth'

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  course: '',
  year: ''
}

export default function App() {
  const [token, setToken] = useState(
    () => sessionStorage.getItem('edusphere_token') || ''
  )
  const [role, setRole] = useState(
    () => sessionStorage.getItem('edusphere_role') || ''
  )
  const [loginEmail, setLoginEmail] = useState(
    () => sessionStorage.getItem('edusphere_email') || ''
  )
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [activationEmail, setActivationEmail] = useState('')
  const [activationOtp, setActivationOtp] = useState('')
  const [activationPassword, setActivationPassword] = useState('')
  const [activationMessage, setActivationMessage] = useState('')
  const [activationError, setActivationError] = useState('')
  const [activationStep, setActivationStep] = useState('email')
  const [resetEmail, setResetEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  const [resetMessage, setResetMessage] = useState('')
  const [loginMessage, setLoginMessage] = useState('')

  const [students, setStudents] = useState([])
  const [studentProfile, setStudentProfile] = useState(null)
  const [courses, setCourses] = useState([])
  const [profileError, setProfileError] = useState('')
  const [active, setActive] = useState('Dashboard')
  const [dark, setDark] = useState(false)
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)

  async function handleLogin(e) {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)

    try {
      const response = await fetch(`${AUTH_API}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          typeof data === 'string'
            ? data
            : 'Invalid email or password'
        )
      }

      if (!data.token || !data.role) {
        throw new Error('Login response did not contain a token or role')
      }

      sessionStorage.setItem('edusphere_token', data.token)
      sessionStorage.setItem('edusphere_role', data.role)
      sessionStorage.setItem('edusphere_email', loginEmail.trim())

      setToken(data.token)
      setRole(data.role)
      setLoginPassword('')
      setLoginError('')
      setActive('Dashboard')
    } catch (err) {
      setLoginError(err.message || 'Unable to login')
    } finally {
      setLoginLoading(false)
    }
  }
  async function handleForgotPassword(e) {
    e.preventDefault()

    setResetError('')
    setResetMessage('')
    setResetLoading(true)

    try {
      const response = await fetch(`${AUTH_API}/password/forgot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: resetEmail.trim()
        })
      })

      const message = await response.text()

      if (!response.ok) {
        throw new Error(message || 'Unable to send OTP')
      }

      setResetMessage(message)
      setAuthMode('reset')
    } catch (err) {
      setResetError(err.message || 'Unable to send OTP')
    } finally {
      setResetLoading(false)
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault()

    setResetError('')
    setResetMessage('')
    setResetLoading(true)

    try {
      const response = await fetch(`${AUTH_API}/password/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: resetEmail.trim(),
          otp: otp.trim(),
          newPassword
        })
      })

      const message = await response.text()

      if (!response.ok) {
        throw new Error(message || 'Password reset failed')
      }

      setLoginEmail(resetEmail.trim())
      setLoginPassword('')
      setOtp('')
      setNewPassword('')
      setLoginMessage(message)
      setResetMessage('')
      setResetError('')
      setAuthMode('login')
    } catch (err) {
      setResetError(err.message || 'Password reset failed')
    } finally {
      setResetLoading(false)
    }
  }
  async function handleSendActivationOtp(e) {
    e.preventDefault()

    setActivationMessage('')
    setActivationError('')

    try {
      const response = await fetch(
        `${AUTH_API}/activation/send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: activationEmail.trim()
          })
        }
      )

      const message = await response.text()

      if (!response.ok) {
        throw new Error(message || 'Unable to send activation OTP')
      }

      setActivationMessage(message)
      setActivationStep('otp')

    } catch (error) {
      setActivationError(error.message)
    }
  }
  async function handleActivateAccount(e) {
    e.preventDefault()

    setActivationMessage('')
    setActivationError('')

    try {
      const response = await fetch(
        `${AUTH_API}/activation/verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: activationEmail.trim(),
            otp: activationOtp.trim(),
            newPassword: activationPassword
          })
        }
      )

      const message = await response.text()

      if (!response.ok) {
        throw new Error(message || 'Account activation failed')
      }

      setActivationMessage(message)
      setLoginEmail(activationEmail.trim())
      setLoginPassword('')
      setActivationOtp('')
      setActivationPassword('')
      setActivationStep('email')
      setAuthMode('login')

    } catch (error) {
      setActivationError(error.message)
    }
  }
  function handleLogout() {
    sessionStorage.removeItem('edusphere_email')
    setStudentProfile(null)
    setProfileError('')
    sessionStorage.removeItem('edusphere_token')
    sessionStorage.removeItem('edusphere_role')

    setToken('')
    setRole('')
    setStudents([])
    setSelectedStudent(null)
    setLoginEmail('')
    setLoginPassword('')
    setActive('Dashboard')
    setError('')
    setLoginError('')
  }

  async function load(search = '') {
    if (!token || role !== 'ADMIN') return

    try {
      const url = search
        ? `${API}?q=${encodeURIComponent(search)}`
        : API

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Session expired or access denied. Please login again.')
        }
        throw new Error('Unable to load students')
      }

      setStudents(await response.json())
      setError('')
    } catch (e) {
      setError(e.message + '. Check whether the backend is running.')
    }
  }

  useEffect(() => {
    if (token && role === 'ADMIN') {
      load()
    }
  }, [token, role])
  useEffect(() => {
    if (token && role === 'STUDENT') {
      fetch(`${API}/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(async response => {
          if (!response.ok) {
            throw new Error(
              'Student profile not found. Please contact the administrator.'
            )
          }
          return response.json()
        })
        .then(data => {
          setStudentProfile(data)
          setProfileError('')
        })
        .catch(err => {
          setProfileError(err.message)
        })
    }
  }, [token, role])
  // Load courses for Admin
  useEffect(() => {
    if (token && role === 'ADMIN') {
      fetch('http://localhost:8080/api/courses', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(async response => {
          if (!response.ok) {
            throw new Error('Unable to load courses')
          }
          return response.json()
        })
        .then(data => {
          setCourses(data)
        })
        .catch(err => {
          setError(err.message)
        })
    }
  }, [token, role])

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function saveStudent(e) {
    e.preventDefault()

    const payload = {
      ...form,
      year: form.year ? Number(form.year) : null
    }

    try {
      const url = editing
        ? `${API}/${editing}`
        : `${API}/create-with-account`

      const response = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(
          message || 'Unable to save student'
        )
      }

      setForm(emptyForm)
      setEditing(null)
      setShowForm(false)

      await load(query)
      setError('')

    } catch (e) {
      setError(e.message)
    }
  }
  function editStudent(student) {
    setEditing(student.id)
    setForm({
      name: student.name || '',
      email: student.email || '',
      phone: student.phone || '',
      course: student.course || '',
      year: student.year || ''
    })
    setShowForm(true)
    setSelectedStudent(null)
  }

  async function deleteStudent(id) {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return
    }

    try {
      const response = await fetch(`${API}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Unable to delete student')
      }

      await load(query)
      setSelectedStudent(null)
      setError('')
    } catch (e) {
      setError(e.message)
    }
  }

  function cancelForm() {
    setForm(emptyForm)
    setEditing(null)
    setShowForm(false)
  }

  const menu = [
    ['Dashboard', '▦'],
    ['Students', '♙'],
    ['Courses', '▤'],
    ['Departments', '🏢'],
    ['Attendance', '◷'],
    ['Marks & Grades', '✎'],
    ['Reports', '▥'],
    ['Settings', '⚙']
  ]

  // LOGIN SCREEN
  if (!token) {
    return (
      <div className="app login-page">
        <form
          className="content-card login-card"
          onSubmit={
            authMode === 'login'
              ? handleLogin
              : authMode === 'forgot'
                ? handleForgotPassword
                : authMode === 'reset'
                  ? handleResetPassword
                  : activationStep === 'email'
                    ? handleSendActivationOtp
                    : handleActivateAccount
          }
        >
          <div className="brand">
            <span className="brand-icon">E</span>
            <span>EduSphere</span>
          </div>

          <h2>
            {authMode === 'login'
              ? 'Welcome Back'
              : authMode === 'forgot'
                ? 'Forgot Password?'
                : authMode === 'reset'
                  ? 'Reset Password'
                  : 'Activate Student Account'}
          </h2>

          <p>
            {authMode === 'login'
              ? 'Sign in to your academic management portal.'
              : authMode === 'forgot'
                ? 'Enter your registered email to receive an OTP.'
                : authMode === 'reset'
                  ? 'Enter your OTP and create a new password.'
                  : 'Verify your activation OTP and create your student password.'}
          </p>
          {authMode === 'login' && (
            <>
              {loginError && <p className="error">{loginError}</p>}
              {loginMessage && <p className="success-message">{loginMessage}</p>}

              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                required
              />

              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                required
              />

              <button type="submit" disabled={loginLoading}>
                {loginLoading ? 'Signing in...' : 'Login'}
              </button>

              <button
                type="button"
                className="forgot-password-link"
                onClick={() => {
                  setResetEmail(loginEmail)
                  setResetError('')
                  setResetMessage('')
                  setAuthMode('forgot')
                }}
              >
                Forgot Password?
              </button>
              <button
                type="button"
                className="forgot-password-link"
                onClick={() => {
                  setActivationEmail(loginEmail)
                  setActivationOtp('')
                  setActivationPassword('')
                  setActivationMessage('')
                  setActivationError('')
                  setActivationStep('email')
                  setAuthMode('activate')
                }}
              >
                Activate Student Account
              </button>
            </>
          )}
          {authMode === 'activate' && (
            <>
              {activationMessage && (
                <p className="success-message">
                  {activationMessage}
                </p>
              )}

              {activationError && (
                <p className="error">
                  {activationError}
                </p>
              )}

              {activationStep === 'email' ? (
                <>
                  <label>Student Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={activationEmail}
                    onChange={(e) =>
                      setActivationEmail(e.target.value)
                    }
                    required
                  />

                  <button type="submit">
                    Send Activation OTP
                  </button>
                </>
              ) : (
                <>
                  <label>Activation OTP</label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={activationOtp}
                    onChange={(e) =>
                      setActivationOtp(e.target.value)
                    }
                    maxLength={6}
                    required
                  />

                  <label>Create New Password</label>
                  <input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={activationPassword}
                    onChange={(e) =>
                      setActivationPassword(e.target.value)
                    }
                    minLength={8}
                    required
                  />

                  <button type="submit">
                    Activate Account
                  </button>
                </>
              )}

              <button
                type="button"
                className="forgot-password-link"
                onClick={() => setAuthMode('login')}
              >
                Back to Login
              </button>
            </>
          )}
          {authMode === 'forgot' && (
            <>


              {resetError && <p className="error">{resetError}</p>}

              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                required
              />

              <button type="submit" disabled={resetLoading}>
                {resetLoading ? 'Sending OTP...' : 'Send OTP'}
              </button>

              <button
                type="button"
                className="forgot-password-link"
                onClick={() => {
                  setAuthMode('login')
                  setResetError('')
                  setResetMessage('')
                }}
              >
                Back to Login
              </button>
            </>
          )}

          {authMode === 'reset' && (
            <>

              {resetError && <p className="error">{resetError}</p>}
              {resetMessage && <p className="success-message">{resetMessage}</p>}

              <label>Email Address</label>
              <input
                type="email"
                value={resetEmail}
                readOnly
              />

              <label>OTP</label>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                maxLength={6}
                required
              />

              <label>New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                minLength={8}
                required
              />

              <button type="submit" disabled={resetLoading}>
                {resetLoading ? 'Resetting...' : 'Reset Password'}
              </button>

              <button
                type="button"
                className="forgot-password-link"
                onClick={() => {
                  setAuthMode('login')
                  setResetError('')
                  setResetMessage('')
                }}
              >
                Back to Login
              </button>
            </>
          )}
        </form>
      </div>
    )
  }

  // STUDENT SCREEN - PROFILE ACCESS WILL BE CONNECTED NEXT
  if (role === 'STUDENT') {
    return (
      <div className={dark ? 'app dark' : 'app'}>
        <main className="main">
          <nav className="topbar">
            <div>
              <p className="welcome">EDUSPHERE STUDENT PORTAL</p>
              <h2>Student Dashboard</h2>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="theme-button"
                onClick={() => setDark(!dark)}
              >
                {dark ? '☀ Light Mode' : '☾ Dark Mode'}
              </button>

              <button className="theme-button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </nav>

          <section className="hero">
            <div>
              <p>WELCOME TO EDUSPHERE</p>
              <h1>My Academic Profile</h1>
              <span>View your registered student information.</span>
            </div>
            <div className="hero-symbol">🎓</div>
          </section>

          <section className="content-card">
            <h3>My Student Details</h3>

            {profileError && (
              <p className="error">{profileError}</p>
            )}

            {!studentProfile && !profileError && (
              <p>Loading your profile...</p>
            )}

            {studentProfile && (
              <>
                <p><strong>Student ID:</strong> {studentProfile.id}</p>
                <p><strong>Name:</strong> {studentProfile.name}</p>
                <p><strong>Email:</strong> {studentProfile.email}</p>
                <p>
                  <strong>Phone:</strong>{' '}
                  {studentProfile.phone || 'Not provided'}
                </p>
                <p>
                  <strong>Course:</strong>{' '}
                  {studentProfile.course || 'Not provided'}
                </p>
                <p>
                  <strong>Year:</strong>{' '}
                  {studentProfile.year || 'Not provided'}
                </p>
              </>
            )}
          </section>

          <footer>
            EduSphere © 2026 · Student Portal
          </footer>
        </main>
      </div>
    )
  }

  // ADMIN DASHBOARD
  if (role !== 'ADMIN') {
    return (
      <div className="app">
        <main className="main">
          <section className="content-card">
            <h2>Unsupported account role</h2>
            <button onClick={handleLogout}>Logout</button>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className={dark ? 'app dark' : 'app'}>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">E</span>
          <span>EduSphere</span>
        </div>

        <p className="menu-label">MAIN MENU</p>

        {menu.map(([name, icon]) => (
          <button
            key={name}
            className={active === name ? 'menu-item active' : 'menu-item'}
            onClick={() => {
              setActive(name)
              setSelectedStudent(null)
              setError('')
            }}
          >
            <span>{icon}</span> {name}
          </button>
        ))}

        <div className="sidebar-bottom">
          <div className="profile-avatar">A</div>
          <div>
            <strong>{loginEmail}</strong>
            <small>Admin Account</small>
          </div>
        </div>
      </aside>

      <main className="main">
        <nav className="topbar">
          <div>
            <p className="welcome">ACADEMIC MANAGEMENT PORTAL</p>
            <h2>{active}</h2>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="theme-button" onClick={() => setDark(!dark)}>
              {dark ? '☀ Light Mode' : '☾ Dark Mode'}
            </button>

            <button className="theme-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </nav>

        {error && <p className="error">{error}</p>}

        {active === 'Dashboard' && (
          <>
            <section className="hero">
              <div>
                <p>WELCOME TO EDUSPHERE</p>
                <h1>Smart Student Management</h1>
                <span>Manage academic activities from one place.</span>
              </div>
              <div className="hero-symbol">🎓</div>
            </section>

            <section className="stats">
              <div className="stat-card">
                <span>Total Students</span>
                <h2>{students.length}</h2>
                <small>Registered students</small>
              </div>
              <div className="stat-card">
                <span>Total Courses</span>
                <h2>—</h2>
                <small>Course management</small>
              </div>
              <div className="stat-card">
                <span>Attendance</span>
                <h2>—</h2>
                <small>Attendance tracking</small>
              </div>
              <div className="stat-card">
                <span>Departments</span>
                <h2>—</h2>
                <small>Department management</small>
              </div>
            </section>

            <section className="content-card">
              <div className="section-heading">
                <div>
                  <h3>Student Overview</h3>
                  <p>Your registered student records</p>
                </div>
                <button onClick={() => setActive('Students')}>
                  View Students →
                </button>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Student Name</th>
                      <th>Email</th>
                      <th>Course</th>
                      <th>Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.slice(0, 5).map(s => (
                      <tr key={s.id}>
                        <td>{s.id}</td>
                        <td>{s.name}</td>
                        <td>{s.email}</td>
                        <td>{s.course}</td>
                        <td>{s.year}</td>
                      </tr>
                    ))}
                    {!students.length && (
                      <tr>
                        <td colSpan="5">No student records available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {active === 'Students' && (
          <section className="content-card">
            <div className="section-heading">
              <div>
                <h3>Student Management</h3>
                <p>Manage all registered student records</p>
              </div>

              <button onClick={() => {
                if (showForm) {
                  cancelForm()
                } else {
                  setEditing(null)
                  setForm(emptyForm)
                  setShowForm(true)
                }
              }}>
                {showForm ? 'Close Form' : '+ Add Student'}
              </button>
            </div>

            {showForm && (
              <form className="student-form" onSubmit={saveStudent}>
                <h3>{editing ? 'Update Student' : 'Add New Student'}</h3>

                <div className="student-form-grid">
                  <input
                    name="name"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={change}
                    required
                  />

                  <input
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    value={form.email}
                    onChange={change}
                    required
                  />

                  <input
                    name="phone"
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={change}
                  />

                  <input
                    name="course"
                    placeholder="Course"
                    value={form.course}
                    onChange={change}
                  />

                  <input
                    name="year"
                    type="number"
                    min="1"
                    max="8"
                    placeholder="Year of Study"
                    value={form.year}
                    onChange={change}
                  />
                </div>

                <div className="form-buttons">
                  <button type="submit">
                    {editing ? 'Save Changes' : 'Add Student'}
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={cancelForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="student-search">
              <input
                className="search-input"
                placeholder="Search name, email or course..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && load(query)}
              />
              <button onClick={() => load(query)}>Search</button>
              <button
                className="cancel-button"
                onClick={() => {
                  setQuery('')
                  load('')
                }}
              >
                Clear
              </button>
            </div>

            {selectedStudent && (
              <div className="student-details">
                <h3>Student Details</h3>
                <p><strong>ID:</strong> {selectedStudent.id}</p>
                <p><strong>Name:</strong> {selectedStudent.name}</p>
                <p><strong>Email:</strong> {selectedStudent.email}</p>
                <p><strong>Phone:</strong> {selectedStudent.phone || 'Not provided'}</p>
                <p><strong>Course:</strong> {selectedStudent.course || 'Not provided'}</p>
                <p><strong>Year:</strong> {selectedStudent.year || 'Not provided'}</p>
                <button onClick={() => setSelectedStudent(null)}>
                  Close Details
                </button>
              </div>
            )}

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Course</th>
                    <th>Year</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id}>
                      <td>{s.id}</td>
                      <td>{s.name}</td>
                      <td>{s.email}</td>
                      <td>{s.phone}</td>
                      <td>{s.course}</td>
                      <td>{s.year}</td>
                      <td>
                        <div className="student-actions">
                          <button
                            className="small-button"
                            onClick={() => setSelectedStudent(s)}
                          >
                            View
                          </button>
                          <button
                            className="small-button"
                            onClick={() => editStudent(s)}
                          >
                            Edit
                          </button>
                          <button
                            className="small-button delete-button"
                            onClick={() => deleteStudent(s.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!students.length && (
                    <tr>
                      <td colSpan="7">No students found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {active === 'Courses' && (
          <section className="content-card">
            <div className="section-header">
              <div>
                <h2>Course Management</h2>
                <p>Manage all available courses</p>
              </div>
              <span className="count-badge">
                {courses.length} Courses
              </span>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Duration</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(course => (
                    <tr key={course.id}>
                      <td>{course.id}</td>
                      <td>{course.courseCode}</td>
                      <td>{course.courseName}</td>
                      <td>{course.duration}</td>
                      <td>{course.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {courses.length === 0 && (
                <p>No courses found.</p>
              )}
            </div>
          </section>
        )}
        {active === 'Departments' && (
          <section className="content-card">
            <div className="section-header">
              <div>
                <h2>Department Management</h2>
                <p>Manage all academic departments</p>
              </div>
              <span className="count-badge">4 Departments</span>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Department Code</th>
                    <th>Department Name</th>
                    <th>Head of Department</th>
                    <th>Description</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>1</td>
                    <td>CSE</td>
                    <td>Computer Science</td>
                    <td>Not Assigned</td>
                    <td>Computer science and programming</td>
                  </tr>

                  <tr>
                    <td>2</td>
                    <td>IT</td>
                    <td>Information Technology</td>
                    <td>Not Assigned</td>
                    <td>Information technology and systems</td>
                  </tr>

                  <tr>
                    <td>3</td>
                    <td>CYBER</td>
                    <td>Cyber Security</td>
                    <td>Not Assigned</td>
                    <td>Network security and ethical hacking</td>
                  </tr>

                  <tr>
                    <td>4</td>
                    <td>DATA</td>
                    <td>Data Analytics</td>
                    <td>Not Assigned</td>
                    <td>Data analysis and visualization</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}
        {active === 'Attendance' && (
          <section className="content-card">
            <div className="section-header">
              <div>
                <h2>Attendance Management</h2>
                <p>Monitor and manage student attendance records</p>
              </div>
              <span className="count-badge">Attendance Records</span>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Records</h3>
                <p>5</p>
              </div>

              <div className="stat-card">
                <h3>Present</h3>
                <p>4</p>
              </div>

              <div className="stat-card">
                <h3>Absent</h3>
                <p>1</p>
              </div>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Student Name</th>
                    <th>Course</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>1</td>
                    <td>BODIGAM SRIJA</td>
                    <td>Java Full Stack</td>
                    <td>20-11-2026</td>
                    <td>Present</td>
                  </tr>

                  <tr>
                    <td>2</td>
                    <td>KAVATI ASHWINI</td>
                    <td>Cyber Security</td>
                    <td>20-11-2026</td>
                    <td>Present</td>
                  </tr>

                  <tr>
                    <td>3</td>
                    <td>Divya</td>
                    <td>Not Assigned</td>
                    <td>20-11-2026</td>
                    <td>Absent</td>
                  </tr>

                  <tr>
                    <td>4</td>
                    <td>Student 4</td>
                    <td>Python Programming</td>
                    <td>20-11-2026</td>
                    <td>Present</td>
                  </tr>

                  <tr>
                    <td>5</td>
                    <td>Student 5</td>
                    <td>Data Analytics</td>
                    <td>20-11-2026</td>
                    <td>Present</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}
        {active === 'Marks & Grades' && (
          <section className="content-card">
            <div className="section-header">
              <div>
                <h2>Marks & Grades Management</h2>
                <p>View and manage student academic performance</p>
              </div>
              <span className="count-badge">5 Records</span>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Students</h3>
                <p>5</p>
              </div>

              <div className="stat-card">
                <h3>Average Marks</h3>
                <p>82%</p>
              </div>

              <div className="stat-card">
                <h3>Highest Marks</h3>
                <p>95%</p>
              </div>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Student Name</th>
                    <th>Course</th>
                    <th>Marks</th>
                    <th>Grade</th>
                    <th>Result</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>1</td>
                    <td>BODIGAM SRIJA</td>
                    <td>Java Full Stack</td>
                    <td>90</td>
                    <td>A+</td>
                    <td>Pass</td>
                  </tr>

                  <tr>
                    <td>2</td>
                    <td>KAVATI ASHWINI</td>
                    <td>Cyber Security</td>
                    <td>85</td>
                    <td>A</td>
                    <td>Pass</td>
                  </tr>

                  <tr>
                    <td>3</td>
                    <td>Divya</td>
                    <td>Not Assigned</td>
                    <td>75</td>
                    <td>B</td>
                    <td>Pass</td>
                  </tr>

                  <tr>
                    <td>4</td>
                    <td>Student 4</td>
                    <td>Python Programming</td>
                    <td>80</td>
                    <td>A</td>
                    <td>Pass</td>
                  </tr>

                  <tr>
                    <td>5</td>
                    <td>Student 5</td>
                    <td>Data Analytics</td>
                    <td>80</td>
                    <td>A</td>
                    <td>Pass</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}
        {active === 'Reports' && (
          <section className="content-card">
            <div className="section-header">
              <div>
                <h2>Academic Reports & Analytics</h2>
                <p>View student performance and course statistics</p>
              </div>
              <span className="count-badge">Reports</span>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Students</h3>
                <p>{students.length}</p>
              </div>

              <div className="stat-card">
                <h3>Total Courses</h3>
                <p>{courses.length}</p>
              </div>

              <div className="stat-card">
                <h3>Report Status</h3>
                <p>Ready</p>
              </div>
            </div>

            <div className="table-wrapper">
              <h3>Student Report</h3>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Course</th>
                    <th>Year</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>{student.id}</td>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>{student.course}</td>
                      <td>{student.year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        {active === 'Settings' && (
          <section className="content-card">
            <div className="section-header">
              <div>
                <h2>System Settings</h2>
                <p>Manage your EduSphere preferences</p>
              </div>
            </div>

            <div className="settings-list">
              <div className="setting-item">
                <h3>Application</h3>
                <p>EduSphere Student Management System</p>
              </div>

              <div className="setting-item">
                <h3>Version</h3>
                <p>Version 1.0</p>
              </div>

              <div className="setting-item">
                <h3>Database</h3>
                <p>MySQL Database Connected</p>
              </div>

              <div className="setting-item">
                <h3>Authentication</h3>
                <p>JWT-based Login System</p>
              </div>

              <div className="setting-item">
                <h3>Theme</h3>
                <p>Use the Dark Mode control in the sidebar.</p>
              </div>
            </div>
          </section>
        )}
        <footer>
          EduSphere © 2026 · Smart Student Management & Academic Analytics Portal
        </footer>
      </main>
    </div>
  )
}