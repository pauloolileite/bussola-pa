from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.perfil == 'admin'


class IsGuia(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.perfil == 'guia'


class IsParceiro(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.perfil == 'parceiro'


class IsAdminOrGuia(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.perfil in ['admin', 'guia']


class IsAdminOrParceiro(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.perfil in ['admin', 'parceiro']


class IsAuthenticatedAndActive(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.status