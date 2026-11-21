import { useEffect, useState } from 'react'

const API = 'http://localhost:8080/api/students'
const empty = { name: '', email: '', phone: '', course: '', year: '' }

export default function App() {
  const [students, setStudents] = useState([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')

  async function load(search = query) {
    try {
      const url = search ? `${API}?q=${encodeURIComponent(search)}` : API
      const response = await fetch(url)
      if (!response.ok) throw new Error('Could not load students')
      setStudents(await response.json())
      setError('')
    } catch (e) { setError(e.message + '. Check that the Spring Boot backend is running.') }
  }

  useEffect(() => { load('') }, [])

  function change(e) { setForm({ ...form, [e.target.name]: e.target.value }) }

  async function submit(e) {
    e.preventDefault()
    const payload = { ...form, year: form.year ? Number(form.year) : null }
    try {
      const response = await fetch(editing ? `${API}/${editing}` : API, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!response.ok) throw new Error(response.status === 409 ? 'Email already exists' : 'Save failed. Check details.')
      setForm(empty); setEditing(null); await load()
    } catch (e) { setError(e.message) }
  }

  function edit(s) {
    setEditing(s.id)
    setForm({ name: s.name || '', email: s.email || '', phone: s.phone || '', course: s.course || '', year: s.year || '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function remove(id) {
    if (!window.confirm('Delete this student?')) return
    try {
      const response = await fetch(`${API}/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Delete failed')
      await load()
    } catch (e) { setError(e.message) }
  }

  return <main className="wrap">
    <header><div><p className="eyebrow">ACADEMIC PROJECT</p><h1>Student Management System</h1><p>Manage student records in one place</p></div><div className="count">{students.length}<small>Students</small></div></header>
    {error && <p className="error">{error}</p>}
    <section className="panel"><h2>{editing ? 'Update Student' : 'Add New Student'}</h2>
      <form onSubmit={submit} className="form">
        <input name="name" placeholder="Full name" value={form.name} onChange={change} required />
        <input name="email" type="email" placeholder="Email address" value={form.email} onChange={change} required />
        <input name="phone" placeholder="Phone number" value={form.phone} onChange={change} />
        <input name="course" placeholder="Course" value={form.course} onChange={change} />
        <input name="year" type="number" min="1" max="8" placeholder="Year of study" value={form.year} onChange={change} />
        <div className="actions"><button>{editing ? 'Save Changes' : 'Add Student'}</button>{editing && <button type="button" className="secondary" onClick={() => {setEditing(null);setForm(empty)}}>Cancel</button>}</div>
      </form>
    </section>
    <section className="panel"><div className="listhead"><h2>Student Records</h2><div className="search"><input placeholder="Search name, email or course" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} /><button onClick={() => load()}>Search</button><button className="secondary" onClick={() => {setQuery('');load('')}}>Clear</button></div></div>
      <div className="tablewrap"><table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Course</th><th>Year</th><th>Actions</th></tr></thead><tbody>
        {students.map(s => <tr key={s.id}><td>{s.id}</td><td>{s.name}</td><td>{s.email}</td><td>{s.phone}</td><td>{s.course}</td><td>{s.year}</td><td><button className="small" onClick={() => edit(s)}>Edit</button> <button className="small danger" onClick={() => remove(s.id)}>Delete</button></td></tr>)}
        {!students.length && <tr><td colSpan="7" className="empty">No student records found.</td></tr>}
      </tbody></table></div>
    </section>
    <footer>Student Management System · React + Spring Boot + MySQL</footer>
  </main>
}
