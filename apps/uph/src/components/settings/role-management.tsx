"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Users,
  Edit,
  Check,
  X,
  Plus,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  getRBACConfig,
  updateRBACConfig,
  getPermissionsForRole,
  getAllPermissionCategories,
  getPermissionsByCategory,
  getPermissionCategory,
  getRoleDisplayName,
  type UserRole,
  type Permission,
} from "@/lib/ecosystem/auth-service";

interface RoleManagementProps {
  onRoleChange?: (role: UserRole, permissions: Permission[]) => void;
}

const ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  manager: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  user: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  viewer: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
};

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: "Tüm yetkilere sahip sistem yöneticisi",
  manager: "Projeleri ve ekibi yönetebilir",
  user: "Projeler üzerinde çalışabilir",
  viewer: "Sadece görüntüleme yetkisi",
};

export function RoleManagement({ onRoleChange }: RoleManagementProps) {
  const [config, setConfig] = useState(getRBACConfig());
  const [selectedRole, setSelectedRole] = useState<UserRole>("user");
  const [editMode, setEditMode] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const roles: UserRole[] = ["admin", "manager", "user", "viewer"];
  const categories = getAllPermissionCategories();

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const isPermissionEnabled = (permission: Permission): boolean => {
    const rolePermissions = config.rolePermissions[selectedRole] || [];
    // Admin always has all
    if (selectedRole === "admin") return true;
    return rolePermissions.includes(permission);
  };

  const togglePermission = (permission: Permission) => {
    if (selectedRole === "admin") return; // Admin can't be modified

    const currentPermissions = [...(config.rolePermissions[selectedRole] || [])];
    const index = currentPermissions.indexOf(permission);

    if (index >= 0) {
      currentPermissions.splice(index, 1);
    } else {
      currentPermissions.push(permission);
    }

    const newConfig = updateRBACConfig({
      rolePermissions: {
        ...config.rolePermissions,
        [selectedRole]: currentPermissions,
      },
    });

    setConfig(newConfig);
    onRoleChange?.(selectedRole, currentPermissions);
  };

  const getPermissionCount = (role: UserRole): number => {
    if (role === "admin") return "∞" as unknown as number;
    return (config.rolePermissions[role] || []).length;
  };

  const getPermissionDisplayName = (permission: Permission): string => {
    const [, action] = permission.split(":");
    const actionNames: Record<string, string> = {
      read: "Okuma",
      write: "Yazma",
      delete: "Silme",
      approve: "Onaylama",
      send: "Gönderme",
      share: "Paylaşma",
      export: "Dışa Aktarma",
      invite: "Davet Etme",
      all: "Tüm Yetkiler",
    };
    return actionNames[action] || action;
  };

  return (
    <div className="space-y-6">
      {/* Role Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {roles.map((role) => (
          <Card
            key={role}
            className={`cursor-pointer transition-all ${
              selectedRole === role
                ? "ring-2 ring-primary shadow-lg"
                : "hover:shadow-md"
            }`}
            onClick={() => setSelectedRole(role)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge className={ROLE_COLORS[role]}>{getRoleDisplayName(role)}</Badge>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-2">
                {ROLE_DESCRIPTIONS[role]}
              </p>
              <p className="text-sm font-medium">
                {typeof getPermissionCount(role) === "number"
                  ? `${getPermissionCount(role)} yetki`
                  : "Sınırsız yetki"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Permissions Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Badge className={ROLE_COLORS[selectedRole]}>
                  {getRoleDisplayName(selectedRole)}
                </Badge>
                Yetkileri
              </CardTitle>
              <CardDescription>
                {selectedRole === "admin"
                  ? "Admin rolü tüm yetkilere sahiptir ve değiştirilemez"
                  : "Bu role ait yetkileri düzenleyin"}
              </CardDescription>
            </div>
            {selectedRole !== "admin" && (
              <Button
                variant={editMode ? "default" : "outline"}
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Kaydet
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-1" />
                    Düzenle
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map((category) => {
              const permissions = getPermissionsByCategory(category);
              const enabledCount = permissions.filter((p) =>
                isPermissionEnabled(p)
              ).length;
              const isExpanded = expandedCategories.has(category);

              return (
                <div key={category} className="border rounded-lg">
                  <button
                    className="w-full flex items-center justify-between p-3 hover:bg-muted/50"
                    onClick={() => toggleCategory(category)}
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <span className="font-medium">
                        {getPermissionCategory(`${category}:read` as Permission)}
                      </span>
                    </div>
                    <Badge variant="outline">
                      {enabledCount}/{permissions.length}
                    </Badge>
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {permissions.map((permission) => (
                        <div
                          key={permission}
                          className="flex items-center gap-2"
                        >
                          <Switch
                            id={permission}
                            checked={isPermissionEnabled(permission)}
                            onCheckedChange={() => togglePermission(permission)}
                            disabled={!editMode || selectedRole === "admin"}
                          />
                          <Label
                            htmlFor={permission}
                            className={`text-sm ${
                              !isPermissionEnabled(permission) &&
                              selectedRole !== "admin"
                                ? "text-muted-foreground"
                                : ""
                            }`}
                          >
                            {getPermissionDisplayName(permission)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// User Role Assignment Dialog
interface AssignRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  currentRole: UserRole;
  onAssign: (role: UserRole) => void;
}

export function AssignRoleDialog({
  open,
  onOpenChange,
  userName,
  currentRole,
  onAssign,
}: AssignRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const roles: UserRole[] = ["admin", "manager", "user", "viewer"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rol Ata</DialogTitle>
          <DialogDescription>
            {userName} için yeni rol seçin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Rol</Label>
            <Select
              value={selectedRole}
              onValueChange={(v) => setSelectedRole(v as UserRole)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    <div className="flex items-center gap-2">
                      <Badge className={`${ROLE_COLORS[role]} text-xs`}>
                        {getRoleDisplayName(role)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {ROLE_DESCRIPTIONS[role]}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedRole !== currentRole && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Rol Değişikliği Uyarısı
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                Bu değişiklik kullanıcının erişim yetkilerini anında güncelleyecektir.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button
            onClick={() => {
              onAssign(selectedRole);
              onOpenChange(false);
            }}
            disabled={selectedRole === currentRole}
          >
            Rol Ata
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
