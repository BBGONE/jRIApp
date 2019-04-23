using Microsoft.EntityFrameworkCore.ChangeTracking;
using System;
using System.Collections.Generic;
using System.Linq;

namespace RIAPP.DataService.EFCore.Utils
{
    /// <summary>
    /// This is a workaround to update owned entities https://github.com/aspnet/EntityFrameworkCore/issues/13890
    /// </summary>
    public static class EntityUpdateHelper
    {
        private class EntryValue
        {
            public int Level { get; set; }
            public ReferenceEntry Reference { get; set; }
            public EntityEntry Entry { get; set; }
            public object parentEntity { get; set; }
            public object Entity { get; set; }
        }

        private static EntryValue[] _GetOwnedEntryValues(EntryValue entryValue, List<EntryValue> entryList=null, int level = 0)
        {
            if (entryList== null)
            {
                entryList = new List<EntryValue>();
            }
            entryList.Add(entryValue);

            MemberEntry[] members = entryValue.Entry.Members.ToArray();
            ReferenceEntry[] references = members.OfType<ReferenceEntry>().ToArray();
            foreach (var _reference in references)
            {
                var currentEntity = _reference.Metadata.PropertyInfo.GetValue(entryValue.Entity);
                int nextLevel = level + 1;
                var currentEntryValue = new EntryValue { Level = nextLevel, Entry = _reference.TargetEntry, Entity = currentEntity, Reference = _reference, parentEntity = entryValue.Entity };
                _GetOwnedEntryValues(currentEntryValue, entryList, nextLevel);
            }

            return entryList.ToArray();
        }

        private static void _SetValuesAtLevel(int lvl, ILookup<int, EntryValue> entryLookUp, int maxLvl, Action<EntityEntry, object> setValuesAction)
        {
            foreach (var ev in entryLookUp[lvl])
            {
                var metadata = ev.Reference.Metadata;
                // Type currentValueType = metadata.ClrType;
                // string name = metadata.Name;
                var currentValue = metadata.PropertyInfo.GetValue(ev.parentEntity);
                if (currentValue != null)
                {
                    setValuesAction(ev.Entry, currentValue);
                    int nextLvl = lvl + 1;
                    if (maxLvl >= nextLvl)
                    {
                        _SetValuesAtLevel(nextLvl, entryLookUp, maxLvl, setValuesAction);
                    }
                }
            }
        }

        /// <summary>
        ///  This is a workaround to update owned entities https://github.com/aspnet/EntityFrameworkCore/issues/13890
        /// </summary>
        /// <param name="entry">Top level entry on which to set the values</param>
        /// <param name="entity">the Values in the form of an object</param>
        public static void _SetRootValues(EntityEntry entry, object entity, Action<EntityEntry, object> setValuesAction)
        {
            setValuesAction(entry, entity);
            var entryValue = new EntryValue { Level = 0, Entry = entry, Entity = entity, Reference = null, parentEntity = null };
            var entryValues = _GetOwnedEntryValues(entryValue);
            var levels = entryValues.Select(e => e.Level).ToArray();
            var maxLvl = levels.Max();
            if (maxLvl >= 1)
            {
                var entriesLookUp = entryValues.ToLookup(e => e.Level);
                _SetValuesAtLevel(1, entriesLookUp, maxLvl, setValuesAction);
            }
        }

        /// <summary>
        /// Extension method to set original values on entity entries
        /// </summary>
        /// <param name="entry"></param>
        /// <param name="origValues"></param>
        public static void SetOriginalValues(this EntityEntry entry, object origValues)
        {
            EntityUpdateHelper._SetRootValues(entry, origValues, (entryParam, entityParam) => entryParam.OriginalValues.SetValues(entityParam));
        }
    }
}
