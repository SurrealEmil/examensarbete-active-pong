using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class GameMode
    {
        private Guid _gameModeId;

        [JsonProperty("id")]
        public string GameModeId => _gameModeId.ToString();

        public string PartitionKey => GameModeId;

        public string Name { get; private set; }
        public string Description { get; private set; }

        public GameMode(Guid gameModeId, string name, string description)
        {
            _gameModeId = gameModeId;
            Name = name;
            Description = description;
        }
    }
}
