const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

class YamlDatabase extends require("./IDatabase") {
  constructor(baseDir) {
    super();
    this.baseDir = baseDir;
  }

  async findOne(collection, query) {
    try {
      if (query.dclass) {
        query.class = query.dclass;
        delete query.dclass;
      }
      const files = fs.readdirSync(this.baseDir);
      const yamlFiles = files.filter((file) => file.endsWith(".yaml"));
      for (const file of yamlFiles) {
        const filePath = path.join(this.baseDir, file);
        const fileContents = fs.readFileSync(filePath, "utf8");
        const data = yaml.load(fileContents);
        if (this._matchesQuery(data, query)) {
          return data;
        }
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar no YAML:", error);
      return null;
    }
  }

  async findById(collection, id) {
    try {
      const filePath = path.join(this.baseDir, `${id}.yaml`);
      if (!fs.existsSync(filePath)) {
        return null;
      }
      const fileContents = fs.readFileSync(filePath, "utf8");
      return yaml.load(fileContents);
    } catch (error) {
      console.error("Erro ao buscar por ID no YAML:", error);
      return null;
    }
  }

  async save(collection, data) {
    try {
      // Gera um ID se não existir
      if (!data.id) {
        data.id = this._generateId();
      }

      const filePath = path.join(this.baseDir, `${data.id}.yaml`);
      fs.writeFileSync(filePath, yaml.dump(data));
      return data;
    } catch (error) {
      console.error("Erro ao salvar no YAML:", error);
      throw error;
    }
  }

  async update(collection, query, updateData) {
    try {
      // Encontra o documento
      const doc = await this.findOne(collection, query);
      if (!doc) {
        return null;
      }

      // Atualiza os campos
      const updatedDoc = this._updateObject(doc, updateData);

      // Salva o documento atualizado
      const filePath = path.join(this.baseDir, `${doc.id}.yaml`);
      fs.writeFileSync(filePath, yaml.dump(updatedDoc));

      return updatedDoc;
    } catch (error) {
      console.error("Erro ao atualizar no YAML:", error);
      throw error;
    }
  }

  async delete(collection, query) {
    try {
      const doc = await this.findOne(collection, query);
      if (!doc) {
        return false;
      }

      const filePath = path.join(this.baseDir, `${doc.id}.yaml`);
      fs.unlinkSync(filePath);
      return true;
    } catch (error) {
      console.error("Erro ao deletar no YAML:", error);
      throw error;
    }
  }

  _generateId() {
    // Gera um ID único baseado no timestamp e um número aleatório
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  _updateObject(obj, updates) {
    const updated = { ...obj };

    Object.entries(updates).forEach(([key, value]) => {
      if (key.includes(".")) {
        // Atualiza campos aninhados
        const parts = key.split(".");
        let current = updated;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {};
          }
          current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
      } else {
        // Atualiza campos diretos
        updated[key] = value;
      }
    });

    return updated;
  }

  _matchesQuery(data, query) {
    return Object.entries(query).every(([key, value]) => {
      if (key === "$or") {
        return value.some((condition) => this._matchesQuery(data, condition));
      }
      const actualValue = this._getNestedValue(data, key);
      return this._compareValues(actualValue, value);
    });
  }

  _compareValues(actual, expected) {
    if (typeof expected === "object" && expected !== null) {
      // Suporte para operadores de comparação como $eq, $gt, $lt, etc
      return Object.entries(expected).every(([op, value]) => {
        switch (op) {
          case "$eq":
            return actual == value;
          case "$ne":
            return actual !== value;
          case "$gt":
            return actual > value;
          case "$gte":
            return actual >= value;
          case "$lt":
            return actual < value;
          case "$lte":
            return actual <= value;
          case "$in":
            return Array.isArray(value) && value.includes(actual);
          case "$nin":
            return Array.isArray(value) && !value.includes(actual);
          default:
            return actual == expected;
        }
      });
    }
    return actual == expected;
  }

  _getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => {
      if (
        current &&
        typeof current[key] === "string" &&
        current[key].startsWith('"') &&
        current[key].endsWith('"')
      ) {
        current[key] = current[key].slice(1, -1);
      }
      return current ? current[key] : undefined;
    }, obj);
  }
}

module.exports = YamlDatabase;
