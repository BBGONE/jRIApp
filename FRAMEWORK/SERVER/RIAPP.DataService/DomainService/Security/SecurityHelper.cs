using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using RIAPP.DataService.DomainService.Exceptions;
using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.DomainService.Types;
using RIAPP.DataService.Resources;
using RIAPP.DataService.Utils;

namespace RIAPP.DataService.DomainService.Security
{
    public static class SecurityHelper
    {
        public const string AUTHENTICATED = "_mustbe_authenicated";
        public const string ALLOW_ANONYMOUS = "_allow_anonymous";

        public static MethodInfo GetMethodInfo(Type type, string name)
        {
            MethodInfo meth = null;
            if (!string.IsNullOrEmpty(name))
                meth = type.GetMethod(name);
            return meth;
        }

        public static RolesForMethod GetRolesForMethod(MethodInfoData method)
        {
            var method_roles = new RolesForMethod
            {
                MethodName = method.methodInfo.Name,
                Roles = new string[0],
                IsRolesOverride = false
            };
            var roles_list = new LinkedList<string>();

            //the override attribute replaces all other roles for the method
            var override_roles = method.methodInfo.GetCustomAttribute<OverrideAuthorizeAttribute>(false);
            if (override_roles != null)
            {
                method_roles.IsRolesOverride = true;
                method_roles.Roles = override_roles.Roles.Select(a => a.Trim()).Distinct().ToArray();
                return method_roles;
            }

            var attrs =
                method.methodInfo.GetCustomAttributes(typeof(AuthorizeAttribute), false).OfType<AuthorizeAttribute>();
            if (attrs.Count() == 0)
            {
                //allow unauthenticated access
                var passthrough_attrs =
                    method.methodInfo.GetCustomAttributes(typeof(AllowAnonymousAttribute), false)
                        .OfType<AllowAnonymousAttribute>();
                if (passthrough_attrs.Any())
                    roles_list.AddLast(ALLOW_ANONYMOUS);
            }
            else
            {
                //at least user must be authenticated
                roles_list.AddLast(AUTHENTICATED);
                foreach (var attr in attrs)
                {
                    var attr_roles = attr.Roles.Select(a => a.Trim());
                    foreach (var role in attr_roles)
                        roles_list.AddLast(role);
                }
            }
            method_roles.Roles = roles_list.Distinct().ToArray();
            return method_roles;
        }

        public static RoleTree GetRoleTree(IEnumerable<string> serviceRoles, IEnumerable<MethodInfoData> methods)
        {
            var tree = new RoleTree
            {
                Roles = serviceRoles,
                ownerRoles = new RolesForOwner[0],
                methodRoles = new RolesForMethod[0]
            };
            foreach (var method in methods)
            {
                if (method.isInDataManager)
                {
                    var ownerRoles = tree.ownerRoles.Where(r => r.ownerType == method.ownerType).FirstOrDefault();
                    if (ownerRoles == null)
                    {
                        ownerRoles = new RolesForOwner
                        {
                            ownerType = method.ownerType,
                            Roles = new string[0],
                            methodRoles = new RolesForMethod[0]
                        };
                        //the override attribute replaces all other roles
                        var override_roles = method.ownerType.GetCustomAttribute<OverrideAuthorizeAttribute>(false);
                        if (override_roles != null)
                        {
                            ownerRoles.IsRolesOverride = true;
                            ownerRoles.Roles = override_roles.Roles.Select(a => a.Trim()).Distinct().ToArray();
                        }
                        else
                        {
                            //allow unauthenticated access
                            var passthrough_attrs =
                                method.ownerType.GetCustomAttributes(typeof(AllowAnonymousAttribute), false)
                                    .OfType<AllowAnonymousAttribute>();
                            if (passthrough_attrs.Any())
                                ownerRoles.Roles = new[] {ALLOW_ANONYMOUS};
                            else
                                ownerRoles.Roles = GetRolesFromType(method.ownerType);
                        }
                        tree.ownerRoles = tree.ownerRoles.Concat(new[] {ownerRoles});
                    }

                    var method_roles =
                        ownerRoles.methodRoles.Where(m => m.MethodName == method.methodInfo.Name).FirstOrDefault();
                    if (method_roles == null)
                    {
                        method_roles = GetRolesForMethod(method);
                        ownerRoles.methodRoles = ownerRoles.methodRoles.Concat(new[] {method_roles});
                    }
                }
                else
                {
                    var method_roles =
                        tree.methodRoles.Where(m => m.MethodName == method.methodInfo.Name).FirstOrDefault();
                    if (method_roles == null)
                    {
                        method_roles = GetRolesForMethod(method);
                        tree.methodRoles = tree.methodRoles.Concat(new[] {method_roles});
                    }
                }
            }

            return tree;
        }

        public static IEnumerable<string> GetRolesFromType(Type instanceType)
        {
            var roles_list = new LinkedList<string>();
            var attrs = instanceType.GetCustomAttributes(typeof(AuthorizeAttribute), false).OfType<AuthorizeAttribute>();
            if (attrs.Count() > 0)
            {
                //at least user must be authenticated
                roles_list.AddLast(AUTHENTICATED);
            }

            foreach (var attr in attrs)
            {
                var attr_roles = attr.Roles.Select(a => a.Trim());
                foreach (var role in attr_roles)
                    roles_list.AddLast(role);
            }

            var distinct_roles = roles_list.Distinct();
            return distinct_roles;
        }

        public static MethodInfoData GetCRUDMethodInfo(CachedMetadata metadata, string dbSetName, RowInfo rowInfo)
        {
            MethodInfoData method = null;
            switch (rowInfo.changeType)
            {
                case ChangeType.Added:
                    method = metadata.getOperationMethodInfo(dbSetName, MethodType.Insert);
                    break;
                case ChangeType.Deleted:
                    method = metadata.getOperationMethodInfo(dbSetName, MethodType.Delete);
                    break;
                case ChangeType.Updated:
                    method = metadata.getOperationMethodInfo(dbSetName, MethodType.Update);
                    break;
                default:
                    throw new DomainServiceException(string.Format(ErrorStrings.ERR_REC_CHANGETYPE_INVALID, dbSetName,
                        rowInfo.changeType));
            }
            return method;
        }

        public static bool CanAccessMethod(MethodInfoData method, IAuthorizer authorizer)
        {
            try
            {
                authorizer.CheckUserRightsToExecute(method);
                return true;
            }
            catch (AccessDeniedException)
            {
                return false;
            }
        }

        public static DbSetPermit GetDbSetPermissions(CachedMetadata metadata, string dbSetName, IAuthorizer authorizer)
        {
            MethodInfoData method = null;
            var permit = new DbSetPermit();
            permit.dbSetName = dbSetName;
            method = metadata.getOperationMethodInfo(dbSetName, MethodType.Insert);
            permit.canAddRow = method != null && CanAccessMethod(method, authorizer);

            method = metadata.getOperationMethodInfo(dbSetName, MethodType.Update);
            permit.canEditRow = method != null && CanAccessMethod(method, authorizer);

            method = metadata.getOperationMethodInfo(dbSetName, MethodType.Delete);
            permit.canDeleteRow = method != null && CanAccessMethod(method, authorizer);

            method = metadata.getOperationMethodInfo(dbSetName, MethodType.Refresh);
            permit.canRefreshRow = method != null && CanAccessMethod(method, authorizer);
            return permit;
        }

        /// <summary>
        ///     Roles for DataService which contains methods and DataManagers
        ///     it is the highest level
        /// </summary>
        public class RoleTree
        {
            public IEnumerable<RolesForMethod> methodRoles;
            public IEnumerable<RolesForOwner> ownerRoles;
            public IEnumerable<string> Roles;
        }

        /// <summary>
        ///     Roles for DataManager which contains the methods
        /// </summary>
        public class RolesForOwner
        {
            public bool IsRolesOverride;
            public IEnumerable<RolesForMethod> methodRoles;
            public Type ownerType;
            public IEnumerable<string> Roles;
        }

        /// <summary>
        ///     The Lowest level - roles for the methods
        /// </summary>
        public class RolesForMethod
        {
            public bool IsRolesOverride;
            public string MethodName;
            public IEnumerable<string> Roles;
        }
    }
}