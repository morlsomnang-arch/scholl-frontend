import axios from 'axios'
import { useRuntimeConfig, useState } from '#imports'

export interface Role {
  id: number
  name: string
}

export interface Permission {
  createdAt: string | number | Date
  id: number
  name: string
  
}


export interface RoleWithPermissions extends Role {
  Permissions: Permission[]
}

export function useRoles() {
  const config = useRuntimeConfig()
  const api = config.public.apiBase

  /* ===== STATE ===== */
  const roles = useState<Role[]>('roles', () => [])
  const permissions = useState<Permission[]>('permissions', () => [])

  /* ===== TOKEN ===== */
  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`
  })

  /* ===== GET ALL ROLES ===== */
  const fetchRoles = async () => {
    const res = await axios.get(`${api}/roles`, {
      headers: authHeader()
    })
    roles.value = res.data
  }

  /* ===== GET ALL PERMISSIONS ===== */
  const fetchPermissions = async () => {
    const res = await axios.get(`${api}/permissions`, {
      headers: authHeader()
    })
    permissions.value = res.data
  }
  

  /* ===== GET ROLE + PERMISSIONS ===== */
  const fetchRolePermissions = async (roleId: number): Promise<RoleWithPermissions> => {
    const res = await axios.get(`${api}/roles/${roleId}`, {
      headers: authHeader()
    })
    return res.data
  }

  /* ===== ASSIGN / REPLACE PERMISSIONS ===== */
  const updateRolePermissions = async (
    roleId: number,
    permissionIds: number[]
  ) => {
    await axios.post(
      `${api}/roles/${roleId}/permissions`,
      { permission_ids: permissionIds },
      { headers: authHeader() }
    )
  }

  return {
    /* state */
    roles,
    permissions,

    /* methods */
    fetchRoles,
    fetchPermissions,
    fetchRolePermissions,
    updateRolePermissions
  }
}
