using System;

namespace RIAPP.DataService.DomainService.Types
{
    public class CodeGenArgs
    {
        public CodeGenArgs(string lang)
        {
            this.lang = lang;
        }

        public string lang
        {
            get;
            private set;
        }

        public string comment
        {
            get;
            set;
        }

        public bool isDraft
        {
            get;
            set;
        }
    }
}
