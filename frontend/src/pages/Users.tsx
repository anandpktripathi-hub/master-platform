import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Checkbox,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

type User = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  company?: string;
};

type SortKey = "name" | "email" | "role" | "status" | "created" | "company";

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [gotoPageInput, setGotoPageInput] = useState("");

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("user");
  const [editCompany, setEditCompany] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editSaving, setEditSaving] = useState(false);

  // Create User Dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [createFirstName, setCreateFirstName] = useState("");
  const [createLastName, setCreateLastName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createRole, setCreateRole] = useState("user");
  const [createCompany, setCreateCompany] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createSaving, setCreateSaving] = useState(false);

  // Upload CSV Dialog state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadSaving, setUploadSaving] = useState(false);

  const loadUsers = () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("accessToken");

    fetch("http://localhost:4000/api/v1/users/public", {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Request failed with ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const list: User[] = Array.isArray(data?.data) ? data.data : [];
        setUsers(list);
        setSelectedIds([]);
        setPage(1);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Network error while calling backend");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const isSelected = (id: string) => selectedIds.includes(id);

  const handleToggleOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleAll = () => {
    if (selectedIds.length === users.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map((u) => u._id));
    }
  };

  const processed = useMemo(() => {
    const q = search.trim().toLowerCase();
    let filtered = !q
      ? [...users]
      : users.filter((u) => {
          const name = `${u.firstName ?? ""} ${u.lastName ?? ""}`.toLowerCase();
          const email = (u.email ?? "").toLowerCase();
          const company = (u.company ?? "").toLowerCase();
          return name.includes(q) || email.includes(q) || company.includes(q);
        });

    filtered.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;

      const nameA = `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim();
      const nameB = `${b.firstName ?? ""} ${b.lastName ?? ""}`.trim();

      const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      let valA: string | number | boolean = "";
      let valB: string | number | boolean = "";

      switch (sortKey) {
        case "name":
          valA = nameA.toLowerCase();
          valB = nameB.toLowerCase();
          break;
        case "email":
          valA = (a.email ?? "").toLowerCase();
          valB = (b.email ?? "").toLowerCase();
          break;
        case "role":
          valA = (a.role ?? "").toLowerCase();
          valB = (b.role ?? "").toLowerCase();
          break;
        case "status":
          valA = a.isActive ? 1 : 0;
          valB = b.isActive ? 1 : 0;
          break;
        case "created":
          valA = createdA;
          valB = createdB;
          break;
        case "company":
          valA = (a.company ?? "").toLowerCase();
          valB = (b.company ?? "").toLowerCase();
          break;
        default:
          valA = createdA;
          valB = createdB;
          break;
      }

      if (valA < valB) return -1 * dir;
      if (valA > valB) return 1 * dir;
      return 0;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageItems = filtered.slice(start, end);

    return {
      total,
      totalPages,
      page: safePage,
      items: pageItems,
    };
  }, [users, search, sortKey, sortDir, rowsPerPage, page]);

  useEffect(() => {
    if (page > processed.totalPages) {
      setPage(processed.totalPages);
    }
  }, [processed.totalPages, page]);

  const handleGotoPage = () => {
    const num = parseInt(gotoPageInput, 10);
    if (!Number.isNaN(num) && num >= 1 && num <= processed.totalPages) {
      setPage(num);
    }
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Delete user ${user.email}?`)) return;
    const token = localStorage.getItem("accessToken");

    try {
      const res = await fetch(`http://localhost:4000/api/v1/users/${user._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Delete failed with ${res.status}`);
      }

      loadUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    }
  };

  // Toggle Active / Inactive
  const handleToggleStatus = async (user: User) => {
    const token = localStorage.getItem("accessToken");
    const newStatus = !user.isActive;

    try {
      const res = await fetch(
        `http://localhost:4000/api/v1/users/${user._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ isActive: newStatus }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Status update failed with ${res.status}`);
      }

      loadUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  // Edit dialog open
  const openEditDialog = (user: User) => {
    setEditUser(user);
    setEditFirstName(user.firstName ?? "");
    setEditLastName(user.lastName ?? "");
    setEditEmail(user.email);
    setEditRole(user.role ?? "user");
    setEditCompany(user.company ?? "");
    setEditIsActive(user.isActive ?? true);
    setEditOpen(true);
  };

  const closeEditDialog = () => {
    if (editSaving) return;
    setEditOpen(false);
    setEditUser(null);
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!editUser) return;
    const token = localStorage.getItem("accessToken");
    setEditSaving(true);

    try {
      const res = await fetch(
        `http://localhost:4000/api/v1/users/${editUser._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            firstName: editFirstName,
            lastName: editLastName,
            email: editEmail,
            role: editRole,
            company: editCompany,
            isActive: editIsActive,
          }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Update failed with ${res.status}`);
      }

      setEditSaving(false);
      setEditOpen(false);
      setEditUser(null);
      loadUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to update user");
      setEditSaving(false);
    }
  };

  // Open Create Dialog
  const openCreateDialog = () => {
    setCreateFirstName("");
    setCreateLastName("");
    setCreateEmail("");
    setCreateRole("user");
    setCreateCompany("");
    setCreatePassword("");
    setCreateSaving(false);
    setCreateOpen(true);
  };

  // Close Create Dialog
  const closeCreateDialog = () => {
    if (createSaving) return;
    setCreateOpen(false);
  };

  // Save Create
  const handleSaveCreate = async () => {
    const token = localStorage.getItem("accessToken");
    setCreateSaving(true);

    try {
      const res = await fetch("http://localhost:4000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          firstName: createFirstName,
          lastName: createLastName,
          email: createEmail,
          role: createRole,
          company: createCompany,
          password: createPassword,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Create failed with ${res.status}`);
      }

      setCreateSaving(false);
      setCreateOpen(false);
      loadUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to create user");
      setCreateSaving(false);
    }
  };

  // Open Upload Dialog
  const openUploadDialog = () => {
    setUploadFile(null);
    setUploadSaving(false);
    setUploadOpen(true);
  };

  // Close Upload Dialog
  const closeUploadDialog = () => {
    if (uploadSaving) return;
    setUploadOpen(false);
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFile(e.target.files[0]);
    }
  };

  // Save Upload
  const handleSaveUpload = async () => {
    if (!uploadFile) return;
    const token = localStorage.getItem("accessToken");
    setUploadSaving(true);

    const formData = new FormData();
    formData.append("file", uploadFile);

    try {
      const res = await fetch("http://localhost:4000/api/v1/users/bulk", {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Upload failed with ${res.status}`);
      }

      setUploadSaving(false);
      setUploadOpen(false);
      loadUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to upload CSV");
      setUploadSaving(false);
    }
  };

  // Download Sample CSV
  const downloadSampleCsv = () => {
    const headers = ["firstName", "lastName", "email", "role", "company", "password"];
    const sampleRows = [
      ["John", "Doe", "john@example.com", "user", "ABC Corp", "password123"],
      ["Jane", "Smith", "jane@example.com", "admin", "XYZ Ltd", "password456"],
    ];
    const lines = [
      headers.join(","),
      ...sampleRows.map((row) => row.join(",")),
    ];
    const csv = lines.join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sample-users.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download CSV
  const handleDownloadCsv = () => {
    const selected = users.filter((u) => selectedIds.includes(u._id));
    if (!selected.length) {
      alert("Please select at least one user to download CSV.");
      return;
    }

    const rows = selected.map((u, idx) => ({
      SNo: idx + 1,
      Name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(),
      Email: u.email,
      Role: u.role ?? "user",
      Company: u.company ?? "",
      Status: u.isActive ? "Active" : "Inactive",
      Created: u.createdAt ? new Date(u.createdAt).toISOString() : "",
    }));

    const headers = Object.keys(rows[0]);
    const escapeVal = (val: any) => {
      if (val === null || val === undefined) return "";
      const str = String(val);
      if (/[",\n]/.test(str)) {
        return "\"" + str.replace(/"/g, "\"\"") + "\"";
      }
      return str;
    };
    const lines = [
      headers.join(","),
      ...rows.map((row) =>
        headers.map((h) => escapeVal((row as any)[h])).join(",")
      ),
    ];
    const csv = lines.join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const filename = prompt("Enter filename for CSV download:", `users-${new Date().toISOString()}.csv`);
    if (!filename) return;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Users
        </Typography>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            mb: 2,
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              Showing up to {rowsPerPage} users per page from the backend.
              Total: {processed.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Selected: {selectedIds.length}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              alignItems: "center",
            }}
          >
            <TextField
              size="small"
              label="Search (name, email, company)"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Rows per page</InputLabel>
              <Select
                label="Rows per page"
                value={rowsPerPage}
                onChange={(e) => {
                  const v = Number(e.target.value) || 10;
                  setRowsPerPage(v);
                  setPage(1);
                }}
              >
                {[10, 20, 50, 100].map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Sort by</InputLabel>
              <Select
                label="Sort by"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="role">Role</MenuItem>
                <MenuItem value="status">Status</MenuItem>
                <MenuItem value="created">Created date</MenuItem>
                <MenuItem value="company">Company</MenuItem>
              </Select>
            </FormControl>

            <IconButton
              size="small"
              color="primary"
              onClick={() =>
                setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))
              }
            >
              {sortDir === "asc" ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
            </IconButton>

            <Button
              variant="contained"
              size="small"
              color="success"
              onClick={openCreateDialog}
            >
              CREATE USER
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={openUploadDialog}
            >
              UPLOAD CSV
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="primary"
              onClick={handleDownloadCsv}
              disabled={selectedIds.length === 0}
            >
              DOWNLOAD CSV
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1f2937" }}>
                <TableCell sx={{ color: "#fff", width: 50 }}>
                  <Checkbox
                    size="small"
                    sx={{ color: "#9ca3af" }}
                    checked={
                      users.length > 0 && selectedIds.length === users.length
                    }
                    indeterminate={
                      selectedIds.length > 0 &&
                      selectedIds.length < users.length
                    }
                    onChange={handleToggleAll}
                  />
                </TableCell>
                <TableCell sx={{ color: "#fff" }}>S.No</TableCell>
                <TableCell sx={{ color: "#fff" }}>Name</TableCell>
                <TableCell sx={{ color: "#fff" }}>Email</TableCell>
                <TableCell sx={{ color: "#fff" }}>Role</TableCell>
                <TableCell sx={{ color: "#fff" }}>Company</TableCell>
                <TableCell sx={{ color: "#fff" }}>Status</TableCell>
                <TableCell sx={{ color: "#fff" }}>Created</TableCell>
                <TableCell sx={{ color: "#fff" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {processed.items.map((user, index) => {
                const absoluteIndex =
                  (processed.page - 1) * rowsPerPage + index + 1;
                const selected = isSelected(user._id);

                return (
                  <TableRow key={user._id} selected={selected}>
                    <TableCell>
                      <Checkbox
                        size="small"
                        checked={selected}
                        onChange={() => handleToggleOne(user._id)}
                      />
                    </TableCell>
                    <TableCell>{absoluteIndex}</TableCell>
                    <TableCell>
                      {`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
                        "—"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role ?? "user"}</TableCell>
                    <TableCell>{user.company ?? "—"}</TableCell>
                    <TableCell sx={{ color: user.isActive ? "green" : "red" }}>
                      {user.isActive ? "Active" : "Inactive"}
                    </TableCell>
                    <TableCell>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={() => openEditDialog(user)}
                        >
                          EDIT
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="warning"
                          onClick={() => handleToggleStatus(user)}
                        >
                          {user.isActive ? "PAUSE" : "ACTIVATE"}
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          onClick={() => handleDelete(user)}
                        >
                          DELETE
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}

              {processed.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>

        <Box
          sx={{
            mt: 2,
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Page {processed.page} of {processed.totalPages}
          </Typography>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Button
              size="small"
              variant="outlined"
              disabled={processed.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              size="small"
              variant="outlined"
              disabled={processed.page >= processed.totalPages}
              onClick={() =>
                setPage((p) => Math.min(processed.totalPages, p + 1))
              }
            >
              Next
            </Button>

            <TextField
              size="small"
              label="Go to page"
              value={gotoPageInput}
              onChange={(e) => setGotoPageInput(e.target.value)}
              sx={{ width: 100 }}
            />
            <Button
              size="small"
              variant="contained"
              onClick={handleGotoPage}
              disabled={!gotoPageInput}
            >
              Go
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Edit User Dialog */}
      <Dialog open={editOpen} onClose={closeEditDialog} fullWidth maxWidth="sm">
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent
          sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="First name"
            value={editFirstName}
            onChange={(e) => setEditFirstName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Last name"
            value={editLastName}
            onChange={(e) => setEditLastName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Email"
            type="email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              label="Role"
              value={editRole}
              onChange={(e) => setEditRole(e.target.value as string)}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="owner">Owner</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Company"
            value={editCompany}
            onChange={(e) => setEditCompany(e.target.value)}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Active status</InputLabel>
            <Select
              label="Active status"
              value={editIsActive ? "active" : "inactive"}
              onChange={(e) => setEditIsActive(e.target.value === "active")}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeEditDialog} disabled={editSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            disabled={editSaving}
          >
            {editSaving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createOpen} onClose={closeCreateDialog} fullWidth maxWidth="sm">
        <DialogTitle>Create User</DialogTitle>
        <DialogContent
          sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="First name"
            value={createFirstName}
            onChange={(e) => setCreateFirstName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Last name"
            value={createLastName}
            onChange={(e) => setCreateLastName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Email"
            type="email"
            value={createEmail}
            onChange={(e) => setCreateEmail(e.target.value)}
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={createPassword}
            onChange={(e) => setCreatePassword(e.target.value)}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              label="Role"
              value={createRole}
              onChange={(e) => setCreateRole(e.target.value as string)}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="owner">Owner</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Company"
            value={createCompany}
            onChange={(e) => setCreateCompany(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeCreateDialog} disabled={createSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveCreate}
            variant="contained"
            disabled={createSaving}
          >
            {createSaving ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload CSV Dialog */}
      <Dialog open={uploadOpen} onClose={closeUploadDialog} fullWidth maxWidth="sm">
        <DialogTitle>Upload CSV</DialogTitle>
        <DialogContent
          sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}
        >
          <Typography variant="body2">
            CSV file should have columns: firstName, lastName, email, role, company, password.
            You can download a sample CSV and update it with your data.
          </Typography>
          <Button variant="outlined" size="small" onClick={downloadSampleCsv}>
            Download Sample CSV
          </Button>
          <input type="file" accept=".csv" onChange={handleFileChange} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeUploadDialog} disabled={uploadSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveUpload}
            variant="contained"
            disabled={uploadSaving || !uploadFile}
          >
            {uploadSaving ? "Uploading..." : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Users;
