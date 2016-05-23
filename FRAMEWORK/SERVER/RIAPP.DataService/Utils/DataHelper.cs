using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.DomainService.Types;
using RIAPP.DataService.Resources;
using RIAPP.DataService.Utils.Extensions;
using RIAPP.DataService.Utils.Interfaces;

namespace RIAPP.DataService.Utils
{
    public class DataHelper : IDataHelper
    {
        private readonly IServiceContainer _serviceContainer;

        public DataHelper(IServiceContainer serviceContainer)
        {
            _serviceContainer = serviceContainer;
        }

        public object GetValue(object obj, string propertyName, bool throwErrors)
        {
            var parts = propertyName.Split('.');
            var enityType = obj.GetType();
            var pinfo = enityType.GetProperty(parts[0]);
            if (pinfo == null && throwErrors)
                throw new Exception(string.Format(ErrorStrings.ERR_PROPERTY_IS_MISSING, enityType.Name, propertyName));
            if (pinfo == null)
                return null;
            if (parts.Length == 1)
            {
                return pinfo.GetValue(obj, null);
            }
            var pval = pinfo.GetValue(obj, null);
            if (pval == null)
                throw new Exception(string.Format(ErrorStrings.ERR_PPROPERTY_ISNULL, enityType.Name, pinfo.Name));
            return GetValue(pval, string.Join(".", parts.Skip(1).ToArray()), throwErrors);
        }

        public bool SetValue(object obj, string propertyName, object value, bool throwErrors)
        {
            var parts = propertyName.Split('.');
            var enityType = obj.GetType();
            var pinfo = enityType.GetProperty(parts[0]);
            if (pinfo == null && throwErrors)
                throw new Exception(string.Format(ErrorStrings.ERR_PROPERTY_IS_MISSING, enityType.Name, propertyName));
            if (pinfo == null)
                return false;
            if (parts.Length == 1)
            {
                if (!pinfo.CanWrite)
                {
                    if (throwErrors)
                        throw new Exception(string.Format(ErrorStrings.ERR_PROPERTY_IS_READONLY, enityType.Name,
                            propertyName));
                    return false;
                }
                pinfo.SetValue(obj, value, null);
                return true;
            }
            var pval = pinfo.GetValue(obj, null);
            if (pval == null)
                throw new Exception(string.Format(ErrorStrings.ERR_PPROPERTY_ISNULL, enityType.Name, pinfo.Name));
            return SetValue(pval, string.Join(".", parts.Skip(1).ToArray()), value, throwErrors);
        }

        public object SetFieldValue(object entity, string fullName, Field fieldInfo, string value)
        {
            var parts = fullName.Split('.');
            var enityType = entity.GetType();
            var pinfo = enityType.GetProperty(parts[0]);
            if (pinfo == null)
                throw new Exception(string.Format(ErrorStrings.ERR_PROPERTY_IS_MISSING, enityType.Name,
                    fieldInfo.fieldName));
            if (parts.Length == 1)
            {
                if (!pinfo.CanWrite)
                {
                    throw new Exception(string.Format(ErrorStrings.ERR_PROPERTY_IS_READONLY, enityType.Name,
                        fieldInfo.fieldName));
                }

                var propType = pinfo.PropertyType;
                var IsNullableType = _serviceContainer.ValueConverter.IsNullableType(propType);
                var val = _serviceContainer.ValueConverter.DeserializeField(propType, fieldInfo, value);

                if (val != null)
                    pinfo.SetValue(entity, val, null);
                else if (IsNullableType && val == null)
                    pinfo.SetValue(entity, val, null);
                else if (!propType.IsValueType && val == null)
                    pinfo.SetValue(entity, val, null);
                else
                    throw new Exception(string.Format(ErrorStrings.ERR_FIELD_IS_NOT_NULLABLE, fieldInfo.fieldName));
                return val;
            }
            var pval = pinfo.GetValue(entity, null);
            if (pval == null)
                throw new Exception(string.Format(ErrorStrings.ERR_PPROPERTY_ISNULL, enityType.Name, pinfo.Name));
            return SetFieldValue(pval, string.Join(".", parts.Skip(1).ToArray()), fieldInfo, value);
        }

        public object SerializeField(object fieldOwner, Field fieldInfo)
        {
            object val;
            var isOK = SerializeField(fieldOwner, fieldInfo, false, out val);
            return val;
        }

        public string SerializeField(object fieldOwner, string fullName, Field fieldInfo)
        {
            var parts = fullName.Split('.');
            if (parts.Length == 1)
            {
                var enityType = fieldOwner.GetType();
                var pinfo = enityType.GetProperty(fieldInfo.fieldName);
                if (pinfo == null)
                {
                    throw new Exception(string.Format(ErrorStrings.ERR_PROPERTY_IS_MISSING, enityType.Name,
                        fieldInfo.fieldName));
                }
                var fieldValue = pinfo.GetValue(fieldOwner, null);
                return _serviceContainer.ValueConverter.SerializeField(pinfo.PropertyType, fieldInfo, fieldValue);
            }
            for (var i = 0; i < parts.Length - 1; i += 1)
            {
                var enityType = fieldOwner.GetType();
                var pinfo = enityType.GetProperty(parts[i]);
                if (pinfo == null)
                    throw new Exception(string.Format(ErrorStrings.ERR_PROPERTY_IS_MISSING, enityType.Name, parts[i]));
                fieldOwner = pinfo.GetValue(fieldOwner, null);
            }
            return SerializeField(fieldOwner, parts[parts.Length - 1], fieldInfo);
        }

        public object DeserializeField(Type entityType, Field fieldInfo, object value)
        {
            var propInfo = entityType.GetProperty(fieldInfo.fieldName);

            if (propInfo == null)
                throw new Exception(string.Format(ErrorStrings.ERR_PROPERTY_IS_MISSING, entityType.Name,
                    fieldInfo.fieldName));

            if (fieldInfo.fieldType == FieldType.Object)
            {
                return DeSerializeObjectField(propInfo.PropertyType, fieldInfo, (object[]) value);
            }
            return _serviceContainer.ValueConverter.DeserializeField(propInfo.PropertyType, fieldInfo, (string) value);
        }

        public object ParseParameter(Type paramType, ParamMetadata pinfo, bool isArray, string val)
        {
            var dataType = pinfo.dataType;

            if (isArray && val != null)
            {
                var arr = (string[]) _serviceContainer.Serializer.DeSerialize(val, typeof(string[]));
                if (arr == null)
                    return null;
                var list =
                    (IList) typeof(DataHelper).GetMethod("CreateList", BindingFlags.NonPublic | BindingFlags.Static)
                        .MakeGenericMethod(paramType.GetElementType())
                        .Invoke(null, new object[] {});
                foreach (var v in arr)
                {
                    list.Add(ParseParameter(paramType.GetElementType(), pinfo, false, v));
                }

                return typeof(DataHelper).GetMethod("CreateArray", BindingFlags.NonPublic | BindingFlags.Static)
                    .MakeGenericMethod(paramType.GetElementType())
                    .Invoke(null, new object[] {list});
            }
            return _serviceContainer.ValueConverter.DeserializeValue(paramType, dataType, pinfo.dateConversion, val);
        }

        public Field getFieldInfo(DbSetInfo dbSetInfo, string fullName)
        {
            var fieldsByName = dbSetInfo.GetFieldByNames();
            return fieldsByName[fullName];
        }

        public void ForEachFieldInfo(string path, Field rootField, Action<string, Field> callBack)
        {
            if (rootField.fieldType == FieldType.Object)
            {
                callBack(path + rootField.fieldName, rootField);
                rootField.nested.ForEach(
                    fieldInfo => { ForEachFieldInfo(path + rootField.fieldName + ".", fieldInfo, callBack); });
            }
            else
            {
                callBack(path + rootField.fieldName, rootField);
            }
        }

        private static IList CreateList<T>()
        {
            return new List<T>();
        }

        private static IEnumerable CreateArray<T>(List<T> list)
        {
            return list.ToArray();
        }

        public static int GetLocalDateTimezoneOffset(DateTime dt)
        {
            var uval = dt.ToUniversalTime();
            var tspn = uval - dt;
            return (int) tspn.TotalMinutes;
        }

        private object[] SerializeObjectField(object fieldOwner, Field objectFieldInfo)
        {
            var fieldInfos = objectFieldInfo.GetNestedInResultFields();
            var res = new object[fieldInfos.Length];
            for (var i = 0; i < fieldInfos.Length; ++i)
            {
                res[i] = SerializeField(fieldOwner, fieldInfos[i]);
            }
            return res;
        }

        /// <summary>
        ///     extracts field value from entity, and converts value to a serialized form
        /// </summary>
        protected virtual bool SerializeField(object fieldOwner, Field fieldInfo, bool optional, out object val)
        {
            val = null;
            var enityType = fieldOwner.GetType();
            var pinfo = enityType.GetProperty(fieldInfo.fieldName);
            if (pinfo == null && !optional)
                throw new Exception(string.Format(ErrorStrings.ERR_PROPERTY_IS_MISSING, enityType.Name,
                    fieldInfo.fieldName));

            if (pinfo == null)
            {
                return false;
            }
            if (fieldInfo.fieldType == FieldType.Object)
            {
                var propValue = pinfo.GetValue(fieldOwner, null);
                val = SerializeObjectField(propValue, fieldInfo);
            }
            else
            {
                var fieldValue = pinfo.GetValue(fieldOwner, null);
                val = _serviceContainer.ValueConverter.SerializeField(pinfo.PropertyType, fieldInfo, fieldValue);
            }
            return true;
        }

        private object[] DeSerializeObjectField(Type propType, Field objectFieldInfo, object[] values)
        {
            var fieldInfos = objectFieldInfo.GetNestedInResultFields();
            var res = new object[fieldInfos.Length];
            for (var i = 0; i < fieldInfos.Length; ++i)
            {
                res[i] = DeserializeField(propType, fieldInfos[i], values[i]);
            }
            return res;
        }

        public static MethodInfo GetMethodInfo(Type t, string name)
        {
            MethodInfo meth = null;
            if (!string.IsNullOrEmpty(name))
                meth = t.GetMethod(name, BindingFlags.Instance | BindingFlags.Public | BindingFlags.DeclaredOnly);
            return meth;
        }
    }
}