using RIAPP.DataService.Annotations.CodeGen;
using RIAPP.DataService.Core.Exceptions;
using RIAPP.DataService.Core.Types;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace RIAPP.DataService.Core.CodeGen
{
    public class NewTypeArgs : EventArgs
    {
        public readonly Type ClientType;

        public NewTypeArgs(Type clientType)
        {
            this.ClientType = clientType;
        }
    }

    public class DotNet2TS: IDisposable
    {
        // a container for available services (something like dependency injection container)
        // maps type name to its definition
        private readonly Dictionary<string, string> _tsTypes = new Dictionary<string, string>();

        public DotNet2TS(IServiceContainer serviceContainer)
        {
            ServiceContainer = serviceContainer;
        }

        protected internal IServiceContainer ServiceContainer { get; }

        public event EventHandler<NewTypeArgs> NewClientTypeAdded;

        /// <summary>
        /// Registers type
        /// </summary>
        /// <param name="t"></param>
        /// <returns>registered type name</returns>
        public string RegisterType(Type t)
        {
            var isArray = false;
            var isEnumerable = false;
            var isEnum = false;
            var res = "any";
            try
            {
                if (t.IsGenericType && t.GetGenericTypeDefinition() == typeof(IEnumerable<>))
                {
                    t = t.GetGenericArguments().First();
                    isEnumerable = true;
                }
                else if (t.IsGenericType && t.GetGenericTypeDefinition() == typeof(List<>))
                {
                    t = t.GetGenericArguments().First();
                    isEnumerable = true;
                }
                else if (t.IsArray)
                {
                    isEnumerable = true;
                    t = t.GetElementType();
                }
                else if (t != typeof(string) && typeof(IEnumerable).IsAssignableFrom(t))
                {
                    isEnumerable = true;
                    return "any[]";
                }
                else if (t == typeof(Object))
                {
                    return "any";
                }

                if (t.IsEnum)
                {
                    isEnum = true;
                }

                var dtype = ServiceContainer.GetValueConverter().DataTypeFromType(t, out isArray);
                res = GetTSTypeNameFromDataType(dtype);
                if (isArray || isEnumerable)
                    res = string.Format("{0}[]", res);
                return res;
            }
            catch (UnsupportedTypeException)
            {
                //complex type
                return RegisterComplexType(t, isArray, isEnumerable, isEnum);
            }
        }

        /// <summary>
        /// Registers complex type
        /// </summary>
        /// <param name="t"></param>
        /// <param name="isArray"></param>
        /// <param name="isEnumerable"></param>
        /// <param name="isEnum"></param>
        /// <returns>registered type name</returns>
        protected internal string RegisterComplexType(Type t, bool isArray, bool isEnumerable, bool isEnum)
        {
            string registeredName = "any";
            ExtendsAttribute extendsAttr = null;
            TypeNameAttribute typeNameAttr = null;
            var typeName = isEnum ? t.Name : string.Format("I{0}", t.Name);
            typeNameAttr = t.GetCustomAttributes(typeof(TypeNameAttribute), false).OfType<TypeNameAttribute>().FirstOrDefault();
            if (typeNameAttr != null)
                typeName = typeNameAttr.Name;
            if (!isEnum)
            {
                extendsAttr = t.GetCustomAttributes(typeof(ExtendsAttribute), false).OfType<ExtendsAttribute>().FirstOrDefault();
                StringBuilder extendsSb = null;
                if (extendsAttr != null && extendsAttr.InterfaceNames.Length > 0)
                {
                    extendsSb = new StringBuilder("extends ");
                    var isFirst = true;
                    foreach (var intfName in extendsAttr.InterfaceNames)
                    {
                        if (!isFirst)
                            extendsSb.Append(", ");
                        extendsSb.Append(intfName);
                        isFirst = false;
                    }
                }
                registeredName = GetTypeInterface(t, typeName, extendsSb?.ToString());
            }
            else
            {
                registeredName = GetTSEnum(t, typeName);
            }

            if (isArray || isEnumerable)
                return string.Format("{0}[]", typeName);
            return typeName;
        }

        protected internal static void AddComment(StringBuilder sb, string comment)
        {
            sb.AppendLine("/*");
            sb.Append("\t");
            sb.AppendLine(comment);
            sb.AppendLine("*/");
        }

        public bool IsTypeNameRegistered(string name)
        {
            return _tsTypes.ContainsKey(name);
        }

        /// <summary>
        ///     converts object to TS interface declaration
        /// </summary>
        /// <param name="obj"></param>
        /// <returns></returns>
        protected internal string GetTypeInterface(Type t, string typeName, string extends)
        {
            if (t == typeof(Type))
                throw new ArgumentException("Can not generate interface for a System.Type");

            var name = typeName;
            if (string.IsNullOrEmpty(typeName))
                name = RegisterType(t);
            if (_tsTypes.ContainsKey(name))
                return _tsTypes[name];

            var commentAttr = t.GetCustomAttributes(typeof(CommentAttribute), false).OfType<CommentAttribute>().FirstOrDefault();

            var sb = new StringBuilder();
            if (commentAttr != null && !string.IsNullOrWhiteSpace(commentAttr.Text))
            {
                AddComment(sb, commentAttr.Text);
            }
            sb.AppendFormat("export interface {0}", name);
            if (!string.IsNullOrWhiteSpace(extends))
            {
                sb.Append(" ");
                sb.Append(extends);
            }
            sb.AppendLine();
            sb.AppendLine("{");
            var objProps = t.GetProperties();
            foreach(var propInfo in objProps)
            {
                sb.AppendFormat("\t{0}{1}:{2};", propInfo.CanWrite ? "" : "readonly ", propInfo.Name, RegisterType(propInfo.PropertyType));
                sb.AppendLine();
            }
            sb.AppendLine("}");
            _tsTypes.Add(name, sb.ToString());
            NewClientTypeAdded?.Invoke(this, new NewTypeArgs(t));
            return _tsTypes[name];
        }

        /// <summary>
        ///     converts object to TS enum
        /// </summary>
        /// <param name="obj"></param>
        /// <returns></returns>
        protected internal string GetTSEnum(Type t, string typeName)
        {
            var name = typeName;
            if (string.IsNullOrEmpty(typeName))
                name = RegisterType(t);
            if (_tsTypes.ContainsKey(name))
                return _tsTypes[name];

            var commentAttr =
                t.GetCustomAttributes(typeof(CommentAttribute), false).OfType<CommentAttribute>().FirstOrDefault();

            var sb = new StringBuilder();
            if (commentAttr != null && !string.IsNullOrWhiteSpace(commentAttr.Text))
            {
                AddComment(sb, commentAttr.Text);
            }
            sb.AppendFormat("export enum {0}", name);
            sb.AppendLine();
            sb.AppendLine("{");
            var enumVals = Enum.GetValues(t).Cast<int>().ToArray();
            var isFirst = true;
            Array.ForEach(enumVals, val =>
            {
                if (!isFirst)
                    sb.AppendLine(",");
                var valname = Enum.GetName(t, val);
                sb.AppendFormat("\t{0}={1}", valname, val);
                isFirst = false;
            }
                );
            sb.AppendLine();
            sb.AppendLine("}");
            _tsTypes.Add(name, sb.ToString());
            return _tsTypes[name];
        }

        public string GetInterfaceDeclarations()
        {
            var vals = _tsTypes.Values;
            var sb = new StringBuilder(4096);
            foreach (var str in vals)
            {
                sb.Append(str);
                sb.AppendLine();
            }
            return sb.ToString().TrimEnd('\r', '\n');
        }

        public static string GetTSTypeNameFromDataType(DataType dataType)
        {
            var fieldType = "any";
            switch (dataType)
            {
                case DataType.Binary:
                    fieldType = "number[]";
                    break;
                case DataType.Bool:
                    fieldType = "boolean";
                    break;
                case DataType.DateTime:
                case DataType.Date:
                case DataType.Time:
                    fieldType = "Date";
                    break;
                case DataType.Integer:
                case DataType.Decimal:
                case DataType.Float:
                    fieldType = "number";
                    break;
                case DataType.Guid:
                case DataType.String:
                    fieldType = "string";
                    break;
            }
            return fieldType;
        }

        public DataType DataTypeFromDotNetType(Type type, out bool isArray)
        {
            return ServiceContainer.GetValueConverter().DataTypeFromType(type, out isArray);
        }

        void IDisposable.Dispose()
        {
            NewClientTypeAdded = null;
        }
    }
}